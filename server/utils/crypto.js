const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let _cachedKey = null;
let _cachedKeySource = null;

function getEncryptionKey(strapi) {
  const key = process.env.ENCRYPTION_KEY || strapi?.config?.get('plugin::encrypted-field.encryptionKey');

  if (!key) {
    const errorMsg = '⚠️  ENCRYPTION_KEY not configured. You must set a 64-character hexadecimal key in environment variables or Strapi configuration.';
    if (strapi?.log?.error) {
      strapi.log.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  if (_cachedKey && _cachedKeySource === key) {
    return _cachedKey;
  }

  if (typeof key !== 'string' || key.length !== 64) {
    throw new Error(`ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes). Current: ${key?.length || 0}`);
  }

  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)');
  }

  _cachedKey = Buffer.from(key, 'hex');
  _cachedKeySource = key;
  return _cachedKey;
}

function encrypt(text, strapi) {
  if (typeof text !== 'string') return text;

  if (text === '') return text;

  try {
    const ENCRYPTION_KEY = getEncryptionKey(strapi);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    if (strapi?.log?.error) {
      strapi.log.error(`Encryption error: ${error.message}`);
    }
    throw error;
  }
}

function decrypt(encryptedText, strapi) {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText;
  }

  try {
    const [ivHex, authTagHex, encrypted] = parts;

    if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
      return encryptedText;
    }

    const ENCRYPTION_KEY = getEncryptionKey(strapi);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    if (strapi?.log?.debug) {
      strapi.log.debug(`Decryption error: ${error.message}. Returning original text.`);
    }
    return encryptedText;
  }
}

function validateValue(value, attribute) {
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'Value must be a string'
    };
  }

  if (attribute.regex) {
    try {
      const regex = new RegExp(attribute.regex);
      if (!regex.test(value)) {
        return {
          valid: false,
          error: `Value does not match the validation pattern: ${attribute.regex}`
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: `Invalid regex pattern: ${error.message}`
      };
    }
  }

  if (attribute.maxLength && value.length > attribute.maxLength) {
    return {
      valid: false,
      error: `Value exceeds maximum length of ${attribute.maxLength} characters`
    };
  }

  if (attribute.minLength && value.length < attribute.minLength) {
    return {
      valid: false,
      error: `Value must be at least ${attribute.minLength} characters`
    };
  }

  return { valid: true };
}

function isEncryptedField(attribute) {
  return attribute?.customField === 'plugin::encrypted-field.encrypted-text';
}

module.exports = {
  encrypt,
  decrypt,
  validateValue,
  isEncryptedField,
  getEncryptionKey,
};
