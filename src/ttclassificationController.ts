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
  fetch("https://web-api.racenet.com/api/identity/auth", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/json",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "cookie": "TAsessionID=2a524758-43b7-4c6f-bffd-7a7026021bfe|NEW; _gid=GA1.2.1650814896.1718454335; _gat_UA-29812607-2=1; notice_behavior=implied,us; notice_location=au; _ga=GA1.2.345832612.1718454335; _ga_VEGXVNQ9M9=GS1.1.1718454334.1.1.1718454390.0.0.0",
      "Referer": "https://racenet.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "{\"authCode\":\"QUOhAA4uZocl4mS8j00f5T0y0gFaB_egjAPGFqa4\",\"clientId\":\"RACENET_1_JS_WEB_APP\",\"grantType\":\"authorization_code\",\"codeVerifier\":\"\",\"redirectUri\":\"https://racenet.com/oauthCallback\",\"refreshToken\":\"\"}",
    "method": "POST"
  });
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