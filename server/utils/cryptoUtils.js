import crypto from "crypto";

// Encryption settings
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Validate encryption key length
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('Invalid encryption key length. Must be 32 bytes.');
}

// Encryption function
export const encryptText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text to encrypt must be a non-empty string');
  }
  const iv = crypto.randomBytes(16); // Generate unique IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
};

// Decryption function
export const decryptText = (encryptedObj) => {
  if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) {
    throw new Error('Invalid encrypted object');
  }
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      ENCRYPTION_KEY,
      Buffer.from(encryptedObj.iv, 'hex')
    );
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return '[Decryption Failed]';
  }
};