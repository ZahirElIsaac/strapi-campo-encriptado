import crypto from 'node:crypto';
import type { AttributeLike, StrapiLike } from '../types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY_LENGTH = 64;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getEncryptionKey = (strapi?: StrapiLike): Buffer => {
  const configuredKey = strapi?.config?.get?.('plugin.encrypted-field.encryptionKey');
  const key = process.env.ENCRYPTION_KEY ?? configuredKey;

  if (!key) {
    const errorMsg =
      '⚠️  ENCRYPTION_KEY not configured. You must set a 64-character hexadecimal key in the Strapi environment variables or configuration.';
    strapi?.log?.error?.(errorMsg);
    throw new Error(errorMsg);
  }

  if (typeof key !== 'string' || key.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes). Actual: ${String(key).length}`
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      'ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)'
    );
  }

  return Buffer.from(key, 'hex');
};

const encrypt = (text: unknown, strapi?: StrapiLike): unknown => {
  if (typeof text !== 'string' || text === '') {
    return text;
  }

  try {
    const encryptionKey = getEncryptionKey(strapi);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    strapi?.log?.error?.(`Error encrypting: ${getErrorMessage(error)}`);
    throw error;
  }
};

const decrypt = (encryptedText: unknown, strapi?: StrapiLike): unknown => {
  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText;
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText;
  }

  try {
    const [ivHex, authTagHex, encrypted] = parts;
    if (!ivHex || !authTagHex || !encrypted) {
      return encryptedText;
    }

    if (
      ivHex.length !== IV_LENGTH * 2 ||
      authTagHex.length !== AUTH_TAG_LENGTH * 2
    ) {
      return encryptedText;
    }

    const encryptionKey = getEncryptionKey(strapi);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    strapi?.log?.debug?.(
      `Error decrypting: ${getErrorMessage(error)}. Returning original text.`
    );
    return encryptedText;
  }
};

const validateValue = (
  value: unknown,
  attribute: AttributeLike = {}
): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'The value must be a string',
    };
  }

  if (typeof attribute.regex === 'string' && attribute.regex) {
    try {
      const regex = new RegExp(attribute.regex);
      if (!regex.test(value)) {
        return {
          valid: false,
          error: `The value does not match the validation pattern: ${attribute.regex}`,
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: `Invalid regex pattern: ${getErrorMessage(error)}`,
      };
    }
  }

  if (typeof attribute.maxLength === 'number' && value.length > attribute.maxLength) {
    return {
      valid: false,
      error: `The value exceeds the maximum length of ${attribute.maxLength} characters`,
    };
  }

  if (typeof attribute.minLength === 'number' && value.length < attribute.minLength) {
    return {
      valid: false,
      error: `The value must be at least ${attribute.minLength} characters long`,
    };
  }

  return { valid: true };
};

const isEncryptedField = (attribute: unknown): attribute is AttributeLike => {
  if (!attribute || typeof attribute !== 'object') {
    return false;
  }

  return (
    (attribute as AttributeLike).customField ===
    'plugin::encrypted-field.encrypted-text'
  );
};

export { decrypt, encrypt, getEncryptionKey, isEncryptedField, validateValue };
