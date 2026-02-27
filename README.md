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
- ✅ **Admin UI** with show/hide toggle, resizable inputs and copy to clipboard
- ✅ **Copy notifications** with confirmation toast when copying values
- ✅ **Multi-language support (i18n)**: English and Spanish in the admin panel
- ✅ **Robust key management** with validation and clear error messages
- ✅ **Encrypted data** in database with unique IV and Auth Tag per operation
- ✅ **Reusable** in any collection or component
- ✅ **Full support** for nested components and complex structures

## Requirements

- **Strapi**: v5.0.0 or higher
- **Node.js**: 18.x - 23.x
- **npm**: 6.0.0 or higher

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

Use this option if you need to read the key from a different environment variable name or from a secrets provider:

```javascript
module.exports = ({ env }) => ({
  'encrypted-field': {
    enabled: true,
    config: {
      encryptionKey: env('MY_CUSTOM_SECRET_KEY'),
    },
  },
});
```

#### Generate a secure key

Run this command once to generate a valid key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This outputs a 64-character hexadecimal key (32 bytes) ready to use.

⚠️ **CRITICAL - Key Management**:
- **Store the key securely** (secrets manager, encrypted environment variables)
- **Never** include it in version control
- **If you lose the key**, you will not be able to decrypt existing data
- **Use the same key** across all environments sharing the same database
- **For production**, consider services like AWS Secrets Manager, HashiCorp Vault or similar

### 3. Rebuild the admin panel (first install only)

After installing the plugin for the first time, rebuild the admin panel:

```bash
npm run build
npm run develop
```

## Usage

### 1. Add an encrypted field to a collection

1. Go to **Content-Type Builder**
2. Select a collection or create a new one
3. Click **"Add another field"**
4. Search for **"Encrypted Text"** (with 🔒 icon)
5. Set the field name
6. Save and restart Strapi

### 2. Using the field in the admin panel

The field works like a regular text field with additional security features:

- **Values are hidden** by default (shown as `***`)
- **Eye button**: Toggles between show/hide the value
- **Copy button**: Copies the value to clipboard with a confirmation notification
- **On save**: Value is automatically encrypted before storing
- **On read**: Value is automatically decrypted before displaying
- **In the DB**: Stored as `iv:authTag:encryptedText` (unreadable without the key)
- **In components**: Works the same in nested components at any depth

### 3. API Usage

The API always returns **decrypted** values for authorized requests. You write plain text, the plugin handles encryption transparently.

```bash
# Create an entry with an encrypted field
curl -X POST http://localhost:1337/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John",
      "apiKey": "my-secret-key-123"
    }
  }'

# Read (automatically returns decrypted)
curl -X GET http://localhost:1337/api/users/1
# Response: { "name": "John", "apiKey": "my-secret-key-123" }
```

## Data Validation

The plugin supports validation before encryption. If validation fails, the value is rejected before being encrypted or saved.

### Configure regex validation

1. In Content-Type Builder, select the encrypted field
2. Go to the **"Advanced Settings"** tab
3. In **"RegEx pattern"**, enter your regular expression
4. Save the changes

**Example**: To only accept values that look like an API key:
```regex
^sk-[a-zA-Z0-9]{32}$
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

**What gets stored in the DB:**
```
apiKey: "a1b2c3d4e5f6....:f9e8d7c6b5a4....:9f8e7d6c5b4a3..."
```

**What the admin panel and API show:**
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
- ✅ **Tamper resistance**: Auth Tag detects any modification to the ciphertext
- ✅ **Input validation**: Regex and custom constraints supported
- ✅ **Safe error handling**: Controlled logs without exposing sensitive data
- ✅ **Double-layer decryption**: Lifecycle hooks (internal) + middleware (API responses)

### Best Practices

1. **Key rotation**: Use the included rotation script when changing keys (see below)
2. **Environment separation**: Use different keys per dev/staging/prod
3. **Auditing**: Monitor encryption/decryption error logs
4. **Key backup**: Keep secure copies of keys in multiple locations
5. **Private fields**: Mark sensitive fields as "private" to exclude them from the public API

### Key Rotation (Preventing Data Loss)

⚠️ **IMPORTANT**: If you change `ENCRYPTION_KEY` in your `.env` without re-encrypting your data first, **all existing data will become permanently unreadable**.

Follow this safe process to rotate your key:

1. **Keep your OLD key** — do not remove it yet.
2. **Generate a NEW key** (64-character hexadecimal).
3. **Export the encrypted values** from your database.
4. **Run the rotation script** included in this plugin:
   ```bash
   # From your Strapi project root
   node node_modules/@growy/strapi-plugin-encrypted-field/scripts/rotate-key.js \
     --old=<YOUR_CURRENT_64_CHAR_KEY> \
     --new=<YOUR_NEW_64_CHAR_KEY>
   ```
   The script reads encrypted values from stdin, decrypts with the old key, and re-encrypts with the new key, writing the results to stdout.
5. **Update your database** with the new encrypted values output by the script.
6. **Update your `.env`** with the `NEW_KEY` and remove the old one.
7. **Restart Strapi**.

## Use Cases

- 🔑 Third-party API Keys
- 🔐 Access tokens
- 🔒 Webhook secrets
- 💳 Payment or sensitive information
- 📧 SMTP credentials
- 🔑 Application passwords

## Known Limitations

- ❌ **Search**: Cannot search by encrypted fields (data is encrypted in DB)
- ❌ **Sorting**: Cannot sort by encrypted fields
- ❌ **Filters**: Cannot apply direct filters on encrypted fields
- ❌ **Unique constraint**: Strapi's unique validation will not work correctly on encrypted fields because each encryption produces different ciphertext (random IV)
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
