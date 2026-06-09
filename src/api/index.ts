
import express from 'express';
import {logger} from '../shared/logger';
import jobsRouter from './routes/jobs';
import uploadRouter from './routes/upload';

const app = express();

app.use(express.json());
app.use('/jobs', jobsRouter);
app.use('/upload', uploadRouter);

app.get("/health", (_, res) => {
    logger.info("Health check requested");
    res.json({ status: "ok" });
});

app.listen(3000, () => {
    logger.info("Server is running on port 3000");
});