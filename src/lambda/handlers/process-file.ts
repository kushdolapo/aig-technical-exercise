import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { processCsv } from "../services/csv-processor";
import { updateJobStatus } from "../services/dynamodb.service";
import pino from "pino";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const logger = pino();

export async function handler(event: S3Event): Promise<void> {
  const executionId = Math.random().toString(36).substring(7);
  
  logger.info({ executionId, recordCount: event.Records.length }, "Processing S3 event");

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    try {
      // Extract jobId from the key (assuming format: jobId/filename)
      const jobId = key.split("/")[0];

      logger.info(
        { executionId, jobId, bucket, key },
        "Starting file processing"
      );

      // Update status to PROCESSING (idempotency: use conditional update)
      await updateJobStatus(jobId, "PROCESSING");
      logger.info({ executionId, jobId }, "Job status updated to PROCESSING");

      // Download the file from S3
      logger.debug({ executionId, jobId }, "Downloading file from S3");
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

      // Convert the stream to text
      const csvContent = await response.Body?.transformToString();

      if (!csvContent) {
        throw new Error("Failed to read file content from S3");
      }

      logger.debug(
        { executionId, jobId, contentLength: csvContent.length },
        "File downloaded successfully"
      );

      // Process CSV file
      const result = processCsv(csvContent);

      logger.info(
        { executionId, jobId, result },
        "CSV processed successfully"
      );

      // Update job status in DynamoDB with results
      await updateJobStatus(jobId, "DONE", {
        rowCount: result.rowCount,
        sum: result.sum,
        average: result.average,
        malformedRows: result.malformedRows,
      });

      logger.info(
        { executionId, jobId, result },
        "Job completed successfully"
      );
    } catch (error) {
      const jobId = record.s3.object.key.split("/")[0];

      logger.error(
        {
          executionId,
          jobId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Error processing file"
      );

      // Update job status to FAILED
      try {
        await updateJobStatus(jobId, "FAILED", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } catch (updateError) {
        logger.error(
          {
            executionId,
            jobId,
            updateError: updateError instanceof Error ? updateError.message : String(updateError),
          },
          "Failed to update job status to FAILED"
        );
      }
    }
  }
}
