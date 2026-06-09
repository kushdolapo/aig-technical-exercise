import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import * as path from "path";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(
      this,
      "ExistingBucket",
      "aig-file-processing-dolapo"
    );

    const table = dynamodb.Table.fromTableName(
      this,
      "JobsTable",
      "jobs"
    );

    const processor = new NodejsFunction(
      this,
      "CsvProcessor",
      {
        runtime: lambda.Runtime.NODEJS_22_X,

        entry: path.join(
          __dirname,
          "../../src/lambda/handlers/process-file.ts"
        ),

        handler: "handler",

        projectRoot: path.join(__dirname, "../../"),

        environment: {
          JOBS_TABLE: "jobs",
        },
      }
    );

    bucket.grantRead(processor);

    table.grantReadWriteData(processor);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processor)
    );
  }
}