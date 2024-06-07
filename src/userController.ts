import express, { Request, Response } from 'express';
import { dynamoDb } from './config/aws';
import { createUser, login } from './handler';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const userToken = await login(username, password);
    if (!userToken) return res.status(401).json({ error: 'Invalid credentials!' });
    return res.json(userToken);
  } catch (err) {
    console.log(err);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const newUser = await createUser(username, password);
    return res.json(newUser);
  } catch (err) {
    console.error(err);
  }
});

// router.put('/:id', async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   const params = {
//     TableName: tableName,
//     Key: { id },
//     UpdateExpression: 'set #name = :name',
//     ExpressionAttributeNames: { '#name': 'name' },
//     ExpressionAttributeValues: { ':name': name },
//     ReturnValues: 'UPDATED_NEW'
//   };

//   try {
//     const data = await dynamoDb.update(params).promise();
//     res.json(data.Attributes);
//   } catch (error) {
//     const awsError = error as AWSError;
//     res.status(500).json({ error: awsError.message, code: awsError.code });
//   }
// });

// router.delete('/:id', async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const params = {
//     TableName: tableName,
//     Key: { id }
//   };

//   try {
//     await dynamoDb.delete(params).promise();
//     res.json({ message: 'Item deleted successfully' });
//   } catch (error) {
//     const awsError = error as AWSError;
//     res.status(500).json({ error: awsError.message, code: awsError.code });
//   }
// });

export { router as userRouter };
