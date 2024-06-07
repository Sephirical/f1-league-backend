import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import 'dotenv/config';

const router = express.Router();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-southeast-2' // Specify your AWS region
});
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableName = 'Session';

interface AWSError extends Error {
  code?: string;
  time?: Date;
  requestId?: string;
  statusCode?: number;
  retryable?: boolean;
  retryDelay?: number;
}

router.get('/', async (req: Request, res: Response) => {
  const params = {
    TableName: tableName
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    const awsError = error as AWSError;
    res.status(500).json({ error: awsError.message, code: awsError.code });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': name },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const data = await dynamoDb.update(params).promise();
    res.json(data.Attributes);
  } catch (error) {
    const awsError = error as AWSError;
    res.status(500).json({ error: awsError.message, code: awsError.code });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: { id }
  };

  try {
    await dynamoDb.delete(params).promise();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    const awsError = error as AWSError;
    res.status(500).json({ error: awsError.message, code: awsError.code });
  }
});

export { router as sessionRouter };
