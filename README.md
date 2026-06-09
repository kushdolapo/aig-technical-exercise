# AIG Technical Exercise - File Processing Application

A serverless CSV file processing application built with Node.js, Express, AWS Lambda, and DynamoDB.

## Overview

This application provides a REST API to upload CSV files, process them asynchronously using AWS Lambda, and retrieve processing results. It demonstrates best practices including:

- **Serverless architecture** with AWS Lambda
- **Structured logging** for better observability
- **Error handling and idempotency** for reliable processing
- **Infrastructure as Code** using AWS CDK
- **Comprehensive testing** for business logic

## Architecture

```
┌─────────────────┐
│   REST API      │
│  (Express)      │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  S3      │
    │ (Upload) │
    └────┬─────┘
         │
    ┌────▼────────────────┐
    │  Lambda Function     │
    │  (Process CSV)       │
    └────┬────────────────┘
         │
    ┌────▼──────┐
    │ DynamoDB   │
    │ (Results)  │
    └────────────┘
```

## Features

- **Upload CSV files** via REST API
- **Asynchronous processing** using Lambda triggered by S3 events
- **CSV statistics** calculation (row count, sum, average, malformed rows)
- **Job tracking** with status updates (PENDING → PROCESSING → DONE/FAILED)
- **Structured logging** for debugging and monitoring
- **Error handling** with automatic retry capabilities
- **Idempotent operations** to handle duplicate events safely

## Prerequisites

- Node.js 20+
- AWS Account with appropriate IAM permissions
- AWS CLI configured locally
- CDK CLI installed

## Setup

### 1. Install Dependencies

```bash
# API and core dependencies
npm install

# Infrastructure dependencies
cd infrastructure
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
AWS_REGION=eu-west-1
S3_BUCKET=aig-file-processing-dolapo
DYNAMODB_TABLE=jobs
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

### 3. Deploy Infrastructure

```bash
cd infrastructure
npx cdk bootstrap
npx cdk deploy
cd ..
```

## API Endpoints

### Create Job

```bash
POST /jobs
```

Creates a new job (returns a jobId).

**Response:**
```json
{
  "jobId": "uuid-here"
}
```

### Upload File

```bash
POST /upload
Content-Type: multipart/form-data

file: <CSV file>
```

Uploads a CSV file and creates a corresponding job.

**Response:**
```json
{
  "jobId": "uuid-here"
}
```

### Get Job Status

```bash
GET /jobs/:jobId
```

Retrieves job details and processing results.

**Response (Pending):**
```json
{
  "jobID": "uuid-here",
  "status": "PENDING",
  "createdAt": "2026-06-09T10:00:00.000Z"
}
```

**Response (Done):**
```json
{
  "jobID": "uuid-here",
  "status": "DONE",
  "createdAt": "2026-06-09T10:00:00.000Z",
  "rowCount": 100,
  "sum": 5000,
  "average": 50,
  "malformedRows": 2
}
```

**Response (Failed):**
```json
{
  "jobID": "uuid-here",
  "status": "FAILED",
  "error": "Invalid CSV format"
}
```

## CSV Format

The application expects CSV files with a header row followed by numeric values:

```csv
amount
10
20
30
40
```

## Development

### Run API Locally

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### Run Tests

```bash
npm test
```

### Build TypeScript

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── jobs.ts          # Job endpoints
│   │   └── upload.ts        # File upload endpoint
│   ├── services/
│   │   ├── dynamodb.service.ts
│   │   └── s3.service.ts
│   └── index.ts             # Express app setup
├── lambda/
│   ├── handlers/
│   │   └── process-file.ts  # CSV processing handler
│   └── services/
│       ├── csv-processor.ts # CSV parsing logic
│       └── dynamodb.service.ts
└── shared/
    ├── config.ts            # Configuration validation
    ├── job.ts               # Job types
    └── logger.ts            # Structured logging

infrastructure/
├── lib/
│   └── infrastructure-stack.ts  # CDK stack definition
└── bin/
    └── infrastructure.ts        # CDK app entry point

tests/
└── csv-processor.test.ts   # Unit tests
```

## Logging

Structured logging is configured using Pino. Each log entry includes:

- **requestId/executionId**: Unique identifier for tracing
- **jobId**: Associated job identifier
- **error**: Error details if applicable
- **Context**: Additional relevant data

Example logs:

```json
{
  "level": 30,
  "time": "2026-06-09T10:00:00.000Z",
  "requestId": "abc123",
  "jobId": "def456",
  "msg": "Job created successfully"
}
```

## Error Handling

The application implements comprehensive error handling:

1. **API Errors**: Invalid requests return appropriate HTTP status codes
2. **Lambda Errors**: Processing errors update job status to FAILED
3. **Retry Logic**: S3 event failures are automatically retried by Lambda
4. **Idempotency**: Status updates use conditional logic to prevent duplicate processing

## Monitoring

Monitor your deployment using:

```bash
# View Lambda logs
aws logs tail /aws/lambda/InfrastructureStack-CsvProcessor --follow

# Monitor DynamoDB metrics
aws dynamodb describe-table --table-name jobs --region eu-west-1

# Check S3 event notifications
aws s3api get-bucket-notification-configuration --bucket aig-file-processing-dolapo
```

## Testing

Example test scenarios:

```bash
# Test file upload
curl -X POST http://localhost:3000/upload \
  -F "file=@sample.csv"

# Get job status
curl http://localhost:3000/jobs/abc-123-def

# Create job
curl -X POST http://localhost:3000/jobs
```

## Performance Considerations

- **CSV Processing**: Handles files up to 5MB (configurable in upload.ts)
- **Lambda Timeout**: 60 seconds (adjustable in infrastructure-stack.ts)
- **DynamoDB**: Pay-per-request billing model for automatic scaling
- **Concurrent Processing**: Limited only by Lambda concurrency quotas

## Future Enhancements

- [ ] Angular UI dashboard
- [ ] S3 event filtering for specific file types
- [ ] Webhook notifications on job completion
- [ ] Batch processing for large files
- [ ] Advanced CSV validation and transformation
- [ ] CloudWatch dashboards and alarms
- [ ] Cost optimization analysis

## Troubleshooting

### File not processing
- Check Lambda execution role has S3 and DynamoDB permissions
- Verify S3 bucket name matches configuration
- Review CloudWatch Logs for Lambda errors

### Job status shows PENDING indefinitely
- Check S3 event notification configuration
- Verify Lambda function is deployed
- Review Lambda execution logs

### Upload fails with 500 error
- Ensure file size is under 5MB
- Check DynamoDB table exists and is accessible
- Verify S3 bucket permissions

## Production Deployment

For production, consider:

1. **Enable DynamoDB Point-in-Time Recovery**
   ```bash
   aws dynamodb update-continuous-backups --table-name jobs --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
   ```

2. **Configure CloudWatch Alarms**
   ```bash
   aws cloudwatch put-metric-alarm --alarm-name lambda-errors --statistic Sum --period 300
   ```

3. **Enable VPC Endpoints** for private S3/DynamoDB access

4. **Set up API Gateway** in front of Express API for throttling and authentication

5. **Configure auto-scaling** for DynamoDB

## License

ISC

## Contributors

Developed as part of AIG Technical Exercise