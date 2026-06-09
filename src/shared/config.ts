import dotenv from "dotenv";
dotenv.config();

interface Config {
    port: number;
    awsRegion: string;
    s3Bucket: string;
    dynamodbTable: string;
}

const requiredEnvVars = ['AWS_REGION', 'S3_BUCKET', 'DYNAMODB_TABLE'] as const;

function validateConfig(): Config {
    const missing = requiredEnvVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
        port: Number(process.env.PORT ?? 3000),
        awsRegion: process.env.AWS_REGION!,
        s3Bucket: process.env.S3_BUCKET!,
        dynamodbTable: process.env.DYNAMODB_TABLE!,
    };
}

export const config = validateConfig();