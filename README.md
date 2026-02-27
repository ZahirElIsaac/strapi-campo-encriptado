# Strapi Plugin - Encrypted Field

<div align="center">
  <img src="https://img.shields.io/npm/v/@growy/strapi-plugin-encrypted-field" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@growy/strapi-plugin-encrypted-field" alt="license" />
  <img src="https://img.shields.io/badge/Strapi-v5-blueviolet" alt="Strapi v5" />
</div>

Official **Growy AI** plugin for Strapi that provides a custom encrypted text field using AES-256-GCM. Protect sensitive information directly in your database with transparent encryption and robust validation.

- ✅ **Custom field** "Encrypted Text" in the Content-Type Builder
- ✅ **Automatic encryption** AES-256-GCM on save
- ✅ **Transparent decryption** on read (admin panel and API)
- ✅ **Backend validation** with regex and length constraint support
- ✅ **Native Strapi v5 UI** with visibility controls, resizable inputs and copy to clipboard
- ✅ **Values hidden** by default with show/hide toggle
- ✅ **Copy notifications** confirmation when copying values
- ✅ **Multi-language support (i18n)**: English and Spanish
- ✅ **Robust key management** with validation and clear error messages
- ✅ **Encrypted data** in database with unique IV and Auth Tag per operation
- ✅ **Reusable** in any collection or component
- ✅ **Full support** for nested components and complex structures

## Installation

```bash
npm install @growy/strapi-plugin-encrypted-field
# or
yarn add @growy/strapi-plugin-encrypted-field
```

## Configuration

### 1. Enable the plugin

Create or edit `config/plugins.js` or `config/plugins.ts`:

```javascript
module.exports = {
  'encrypted-field': {
    enabled: true,
  },
};
```

### 2. Configure the encryption key (REQUIRED)

#### Option A: Environment variable (recommended)

Add to your `.env`:

```bash
ENCRYPTION_KEY=your_64_character_hex_key_here
```

#### Option B: Configuration file

Edit `config/plugins.js`:

```javascript
module.exports = ({ env }) => ({
  'encrypted-field': {
    enabled: true,
    config: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
  },
});
```

#### Generate a secure key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will generate a 64-character hexadecimal key (32 bytes).

⚠️ **CRITICAL - Key Management**:
- **Store the key securely** (secrets manager, encrypted environment variables)
- **Never** include it in version control
- **If you lose the key**, you will not be able to decrypt existing data
- **Use the same key** across all environments sharing the same database
- **For production**, consider services like AWS Secrets Manager, HashiCorp Vault or similar

### 3. Rebuild the admin

```bash
npm run build
npm run develop
```

## Requirements

- **Strapi**: v5.0.0 or higher
- **Node.js**: 18.x - 22.x
- **npm**: 6.0.0 or higher

## Data Validation

The plugin supports validation before encryption:

### Configure regex validation

1. In Content-Type Builder, select the encrypted field
2. Go to the **"Advanced Settings"** tab
3. In **"RegEx pattern"**, enter your regular expression
4. Save the changes

**Example**: To validate API key format:
```regex
^sk-[a-zA-Z0-9]{32}$
```

If the value does not match the pattern, an error will be thrown before encryption.

## Usage

### 1. Add an encrypted field to a collection

1. Go to **Content-Type Builder**
2. Select a collection or create a new one
3. Click **"Add another field"**
4. Search for **"Encrypted Text"** (with 🔒 icon)
5. Set the field name
6. Save and restart Strapi

### 2. Using the field

The field works like a regular text field with additional security features:

- **In the panel**: Type text normally
- **Hidden values**: Values are shown as `***` by default
- **Eye button**: Toggles between show/hide the value
- **Copy button**: Copies the value to clipboard with a confirmation notification
- **On save**: Automatically encrypted
- **On read**: Automatically decrypted
- **In the DB**: Stored encrypted with format `iv:authTag:encrypted`
- **In components**: Works the same in nested components at any depth

### 3. API Usage

```bash
# Create with an encrypted field
curl -X POST http://localhost:1337/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John",
      "apiKey": "my-secret-key-123"
    }
  }'

# Read (returns decrypted)
curl -X GET http://localhost:1337/api/users/1
# Response: { "name": "John", "apiKey": "my-secret-key-123" }
```

## Usage Example

### "User" collection with an encrypted API Key

**Schema:**
```json
{
  "name": "string",
  "email": "email",
  "apiKey": "plugin::encrypted-field.encrypted-text"
}
```

**In the DB:**
```
apiKey: "a1b2c3d4e5f6....:f9e8d7c6b5a4....:9f8e7d6c5b4a3..."
```

**In the panel and API:**
```
apiKey: "sk-1234567890abcdef"
```

## Security & Architecture

### Technical Specifications

- **Algorithm**: AES-256-GCM (NIST standard, military grade)
- **Key size**: 256 bits (32 bytes, 64 hex characters)
- **IV (Initialization Vector)**: 96 bits (12 bytes) randomly generated per operation
- **Auth Tag**: 128 bits (16 bytes) for integrity verification
- **Stored format**: `iv:authTag:encryptedData` (all in hexadecimal)
- **Key caching**: Encryption key is parsed and cached in memory for optimal performance

### Security Features

- ✅ **Authenticated encryption**: GCM provides both confidentiality and integrity
- ✅ **Unique IV**: Every encryption operation generates a random IV
- ✅ **Tamper resistance**: Auth Tag detects any modification
- ✅ **Input validation**: Regex and custom constraints supported
- ✅ **Safe error handling**: Controlled logs without exposing sensitive data
- ✅ **Double-layer decryption**: Lifecycle hooks (internal) + middleware (API responses)

### Best Practices

1. **Key rotation**: Use the included rotation script (see below)
2. **Environment separation**: Use different keys per dev/staging/prod
3. **Auditing**: Monitor encryption/decryption error logs
4. **Key backup**: Keep secure copies of keys in multiple locations
5. **Private fields**: Mark sensitive fields as "private" to exclude them from the public API

### Key Rotation

If you need to change your encryption key, use the included rotation script to re-encrypt existing data:

```bash
node scripts/rotate-key.js --old=<CURRENT_64_CHAR_KEY> --new=<NEW_64_CHAR_KEY>
```

The script reads encrypted values from stdin, decrypts with the old key, and re-encrypts with the new key. See the script output for database-specific integration examples (PostgreSQL, etc.).

## Use Cases

- 🔑 Third-party API Keys
- 🔐 Access tokens
- 🔒 Webhook secrets
- 💳 Sensitive information
- 📧 SMTP credentials
- 🔑 Application passwords

## Known Limitations

- ❌ **Search**: Cannot search by encrypted fields (data is encrypted in DB)
- ❌ **Sorting**: Cannot sort by encrypted fields
- ❌ **Filters**: Cannot apply direct filters on encrypted fields
- ❌ **Unique constraint**: Strapi's unique validation will not work correctly on encrypted fields because each encryption produces a different ciphertext (random IV)
- ⚠️ **Performance**: Encryption/decryption adds minimal overhead (~1-2ms per operation)
- ⚠️ **Key synchronization**: All environments sharing the same DB must use the same key

## License

MIT © 2025 Growy AI

## Developed by

**Growy AI** - AI and business automation solutions

**Main author**: Zahir El isaac

---

<div align="center">
  <p>If this plugin is useful to you, consider giving it a ⭐ on GitHub</p>
  <p>Made with ❤️ by the Growy AI team</p>
</div>
