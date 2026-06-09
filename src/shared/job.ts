// This model will be shared by:
// Upload API
// Lambda
// GET job endpoint

export enum JobStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    DONE = 'DONE',
    FAILED = 'FAILED',
}

export interface Job {
    id: string;
    status: JobStatus;
    createdAt: Date;
    fileName?: string;

    rowCount?: number;
    sum?: number;
    average?: number;

    error?: string;

}