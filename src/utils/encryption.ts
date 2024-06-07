import { EncryptRequest } from 'aws-sdk/clients/kms';
import { kms } from '../config/aws';

// Replace with your KMS Key ID
const KMS_KEY_ID = process.env.AWS_KMS_ID;

/**
 * Encrypts a plaintext password using AWS KMS.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} - The base64 encoded ciphertext.
 * @throws {Error} - Throws error if encryption fails.
 */
export const encryptPassword = async (password: string): Promise<string> => {
    const params: EncryptRequest = {
      KeyId: KMS_KEY_ID || '',
      Plaintext: Buffer.from(password)
    };
    try {
      const result = await kms.encrypt(params).promise();
      if (!result.CiphertextBlob) {
        throw new Error('Encryption failed, CiphertextBlob is undefined');
      }
      return result.CiphertextBlob.toString('base64');
    } catch (error) {
      console.error('Error encrypting password:', error);
      throw new Error('Error encrypting password');
    }
  };
  
  /**
   * Decrypts a ciphertext password using AWS KMS.
   * @param {string} encryptedPassword - The base64 encoded ciphertext.
   * @returns {Promise<string>} - The plaintext password.
   * @throws {Error} - Throws error if decryption fails.
   */
  export const decryptPassword = async (encryptedPassword: string): Promise<string> => {
    const params = {
      CiphertextBlob: Buffer.from(encryptedPassword, 'base64')
    };
    try {
      const result = await kms.decrypt(params).promise();
      if (!result.Plaintext) {
        throw new Error('Decryption failed, Plaintext is undefined');
      }
      return result.Plaintext.toString();
    } catch (error) {
      console.error('Error decrypting password:', error);
      throw new Error('Error decrypting password');
    }
  };
