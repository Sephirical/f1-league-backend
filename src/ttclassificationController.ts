import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import 'dotenv/config';
import { authenticateToken } from './middleware/middleware';
import { getUserAuth } from './types/express';
import { QueryInput, ScanInput, UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const router = express.Router();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-southeast-2' // Specify your AWS region
});
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableName = 'TTClassification';

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
    TableName: tableName + 'Name'
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    const awsError = error as AWSError;
    res.status(500).json({ error: awsError.message, code: awsError.code });
  }
});

router.post('/', authenticateToken, async (req: getUserAuth, res: Response) => {
  const { name, trackID } = req.body;

  if (!name || !trackID) {
    return res.status(400).json({ error: 'Name and trackID are required' });
  }

  // const formattedTrackID = trackID.toString().padStart(2, '0');

  const newClassification = {
    className: name,
    track: trackID,
  };

  const params = {
    TableName: 'TTClassificationName', // Replace with your DynamoDB table name
    Item: newClassification,
  };

  try {
    await dynamoDb.put(params).promise();
    res.status(201).json(newClassification);
  } catch (error) {
    console.error('Error creating TT Classification:', error);
    res.status(500).json({ error: 'Could not create TT Classification' });
  }
})

// router.get('/leaderboard', authenticateToken, async (req: getUserAuth, res: Response) => {
//   const { name, racenetToken } = req.body;
//   let racenetUrl = `https://web-api.racenet.com/api/F124Stats/leaderboard/03?platform=3&pageNumber=1&mode=00&weather=D&pageSize=20&playerFocus=false&type=0&version=1&isCrossPlay=false`
//   const response = await fetch()
// });

// router.put('/', authenticateToken, async (req: getUserAuth, res: Response) => {
//   const { oldName, newName } = req.body;

//   const queryParams: QueryInput = {
//     TableName: tableName + 'Name',
//     KeyConditionExpression: 'className = :className',
//     ExpressionAttributeValues: {
//       ':className': newName
//     }
//   }
//   const params: UpdateItemInput = {
//     TableName: tableName + 'Name',
//     Key: { className: oldName},
//     UpdateExpression: 'set #className = :className',
//     ExpressionAttributeNames: { '#className': 'className' },
//     ExpressionAttributeValues: { ':className': newName },
//     ReturnValues: 'UPDATED_NEW'
//   };

//   const bulkParams: UpdateItemInput

//   try {
//     const data = await dynamoDb.update(params).promise();
//     res.json(data.Attributes);
//   } catch (error) {
//     const awsError = error as AWSError;
//     res.status(500).json({ error: awsError.message, code: awsError.code });
//   }
// });

router.post('/', authenticateToken, async (req: getUserAuth, res: Response) => {
  const { name, trackId } = req.body;
  
})

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

export { router as ttclassificationRouter };