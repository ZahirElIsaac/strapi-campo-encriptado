const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(strapi) {
  const key = process.env.ENCRYPTION_KEY || strapi?.config?.get('plugin.encrypted-field.encryptionKey');
  
  if (!key) {
    const errorMsg = '⚠️  ENCRYPTION_KEY no configurada. Debe establecer una clave de 64 caracteres hexadecimales en las variables de entorno o configuración de Strapi.';
    if (strapi?.log?.error) {
      strapi.log.error(errorMsg);
    }
    throw new Error(errorMsg);
  }
  
  if (typeof key !== 'string' || key.length !== 64) {
    throw new Error(`ENCRYPTION_KEY debe tener exactamente 64 caracteres hexadecimales (32 bytes). Actual: ${key?.length || 0}`);
  }
  
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('ENCRYPTION_KEY debe contener solo caracteres hexadecimales (0-9, a-f, A-F)');
  }
  
  return Buffer.from(key, 'hex');
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
      strapi.log.error(`Error al cifrar: ${error.message}`);
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
      strapi.log.debug(`Error al descifrar: ${error.message}. Retornando texto original.`);
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
      error: 'El valor debe ser una cadena de texto' 
    };
  }

  if (attribute.regex) {
    try {
      const regex = new RegExp(attribute.regex);
      if (!regex.test(value)) {
        return { 
          valid: false, 
          error: `El valor no cumple con el patrón de validación: ${attribute.regex}` 
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: `Patrón regex inválido: ${error.message}` 
      };
    }
  }

  if (attribute.maxLength && value.length > attribute.maxLength) {
    return { 
      valid: false, 
      error: `El valor excede la longitud máxima de ${attribute.maxLength} caracteres` 
    };
  }

  if (attribute.minLength && value.length < attribute.minLength) {
    return { 
      valid: false, 
      error: `El valor debe tener al menos ${attribute.minLength} caracteres` 
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
