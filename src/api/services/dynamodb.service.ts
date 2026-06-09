import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import{
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {config} from "../../shared/config";
import {JobStatus} from "../../shared/job";


const client = new DynamoDBClient({ region: config.awsRegion });
const docClient = DynamoDBDocumentClient.from(client);

export async function createJob(
    jobId: string,
    fileName?: string
) {
    await docClient.send(
        new PutCommand({
            TableName: config.dynamodbTable,
            Item: {
                jobID: jobId,
                 fileName: fileName,
                status: JobStatus.PENDING,
                createdAt: new Date().toISOString(),
               
            },
        })
    );
}

export async function getJob(jobId: string) {
    const result = await docClient.send(
        new GetCommand({
            TableName: config.dynamodbTable,
            Key: { jobID: jobId },
        })
    );
    return result.Item;
}

export async function updateJobStatus(
    jobId: string,
    status: JobStatus
) {
    await docClient.send(
        new UpdateCommand({
            TableName: config.dynamodbTable,
            Key: {
                jobID: jobId,
            },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":status": status,
            },
        })
    );
}
