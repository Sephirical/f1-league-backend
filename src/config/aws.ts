import AWS from 'aws-sdk';
import 'dotenv/config';

// Configure AWS SDK with credentials (use IAM roles for production)
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-southeast-2' // Specify your AWS region
});

export const kms = new AWS.KMS();
export const dynamoDb = new AWS.DynamoDB.DocumentClient();