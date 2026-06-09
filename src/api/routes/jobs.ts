 import {Router} from "express";
 import { v4 as uuid } from "uuid";

 import {createJob, getJob } from "../services/dynamodb.service";
 import { logger } from "../../shared/logger";

 const router = Router();

    router.post("/", async (_, res) => {
        const jobId = uuid();
        const requestId = uuid();

        try {
            logger.info({ requestId, jobId }, "Creating new job");

            await createJob(jobId);

            logger.info({ requestId, jobId }, "Job created successfully");

            res.status(201).json({
                jobId,
            });
        } catch (error) {
            logger.error(
                {
                    requestId,
                    jobId,
                    error: error instanceof Error ? error.message : String(error),
                },
                "Failed to create job"
            );

            res.status(500).json({
                message: "Failed to create job",
            });
        }
    });

    router.get("/:jobId", async (req, res) => {
        const requestId = uuid();
        const { jobId } = req.params;

        try {
            logger.info({ requestId, jobId }, "Fetching job details");

            const job = await getJob(jobId);

            if (!job) {
                logger.warn({ requestId, jobId }, "Job not found");
                return res.status(404).json({
                    message: "Job not found",
                });
            }

            logger.info({ requestId, jobId }, "Job details retrieved");

            res.json(job);
        } catch (error) {
            logger.error(
                {
                    requestId,
                    jobId,
                    error: error instanceof Error ? error.message : String(error),
                },
                "Failed to fetch job"
            );

            res.status(500).json({
                message: "Failed to fetch job",
            });
        }
    });

 export default router;