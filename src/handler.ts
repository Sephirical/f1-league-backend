import { dynamoDb } from './config/aws';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { encryptPassword, decryptPassword } from './utils/encryption';
import jwt from 'jsonwebtoken';

const USERS_TABLE = 'User';

interface User {
  userId: string;
  username: string;
  password: string;
}

/**
 * Create a new user in the DynamoDB table.
 * @param {string} username - The user's username.
 * @param {string} password - The user's plaintext password.
 * @returns {Promise<User|null>} - The created user.
 */
export const createUser = async (username: string, password: string): Promise<User|null> => {
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedPassword = await encryptPassword(hashedPassword);

  const user: User = {
    userId,
    username,
    password: encryptedPassword
  };
  // console.log(user);

  const params = {
    TableName: USERS_TABLE,
    Item: user,
    Expected: {
      'username': {
        Exists: false
      }
    }
  };

  try {
    await dynamoDb.put(params).promise();
  } catch (err) {
    console.error(err);
    return null;
  }
  return user;
};

/**
 * Retrieve a user from the DynamoDB table by username.
 * @param {string} username - The user's username.
 * @returns {Promise<User | null>} - The retrieved user or null if not found.
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const params = {
    TableName: USERS_TABLE,
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': username
    }
  };

  const result = await dynamoDb.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return result.Items[0] as User;
  }
  return null;
};

/**
 * Check if the provided password matches the stored password for a user.
 * @param {string} username - The user's username.
 * @param {string} plainPassword - The plaintext password to check.
 * @returns {Promise<boolean>} - True if the password matches, false otherwise.
 */
const checkPassword = async (username: string, plainPassword: string): Promise<boolean> => {
  const user = await getUserByUsername(username);
  if (!user) {
    return false;
  }
  const decryptedPassword = await decryptPassword(user.password);
  return await bcrypt.compare(plainPassword, decryptedPassword);
};

/**
 * Log in a user and return a JWT.
 * @param {string} username - The user's username.
 * @param {string} password - The user's plaintext password.
 * @returns {Promise<string | null>} - The JWT if login is successful, null otherwise.
 */
export const login = async (username: string, password: string): Promise<string | null> => {
  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  const isPasswordValid = await checkPassword(username, password);
  if (!isPasswordValid) {
    return null;
  }

  const token = jwt.sign({ userId: user.userId, username: user.username }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
  return token;
};
