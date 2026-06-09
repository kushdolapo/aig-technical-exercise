import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";

import { createJob, getJob } from "../services/dynamodb.service";
import { uploadFile } from "../services/s3.service";
import { logger } from "../../shared/logger";

const router = Router();

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    const requestId = uuid();
    
    if (!req.file) {
      logger.warn({ requestId }, "File upload request without file");
      return res.status(400).json({
        message: "File required",
      });
    }

    const jobId = uuid();

    try {
      const key = `${jobId}/${req.file.originalname}`;

      logger.info(
        {
          requestId,
          jobId,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        },
        "Starting file upload"
      );

      await createJob(jobId, req.file.originalname);

      await uploadFile(key, req.file.buffer, req.file.mimetype);

      logger.info(
        { requestId, jobId },
        "File uploaded successfully"
      );

      return res.status(201).json({
        jobId,
      });
    } catch (error) {
      logger.error(
        {
          requestId,
          jobId,
          error: error instanceof Error ? error.message : String(error),
        },
        "File upload failed"
      );

      return res.status(500).json({
        message: "Upload failed",
      });
    }
  }
);

export default router;