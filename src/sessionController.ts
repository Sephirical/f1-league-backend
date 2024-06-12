import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import 'dotenv/config';
import { authenticateToken } from './middleware/middleware';
import { getUserAuth } from './types/express';

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

router.get('/', authenticateToken, async (req: getUserAuth, res: Response) => {
  const params = {
    TableName: tableName,
    FilterExpression: "#user = :user",
    ExpressionAttributeNames: {
      "#user": "user"
    },
    ExpressionAttributeValues: {
      ":user": req.user?.userId
    }
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    const awsError = error as AWSError;
    res.status(500).json({ error: awsError.message, code: awsError.code });
  }
});

router.put('/:id', authenticateToken, async (req: getUserAuth, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const params = {
    TableName: tableName,
    Key: { sessionId: id, user: req.user.userId },
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

router.delete('/:id', authenticateToken, async (req: getUserAuth, res: Response) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: { sessionId: id, user: req.user.userId },
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
