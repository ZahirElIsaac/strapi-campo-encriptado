# Strapi Plugin -- Encrypted Field

<div align="center">
  <img src="https://img.shields.io/npm/v/@joeygrable/strapi-plugin-encrypted-field" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@joeygrable/strapi-plugin-encrypted-field" alt="license" />
  <img src="https://img.shields.io/badge/Strapi-v5-blueviolet" alt="Strapi v5" />
</div>

Strapi v5 plugin for Strapi that provides a custom encrypted
text field using AES-256-GCM. Protect sensitive information directly in
your database with transparent encryption and robust validation.

- ✅ **Custom field** "Encrypted Text" in the Content-Type Builder
- ✅ **Automatic encryption** (AES-256-GCM) on save
- ✅ **Transparent decryption** on read (admin panel and API)
- ✅ **Backend validation** with regex and constraint support
- ✅ **Enhanced UI** with visibility controls and copy-to-clipboard
- ✅ **Hidden values** by default with show/hide toggle
- ✅ **Confirmation notifications** when copying values
- ✅ **Robust key management** with validation and clear error messages
- ✅ **Encrypted database storage** with unique IV and Auth Tag
- ✅ **Reusable** in any collection or component
- ✅ **Full support** for nested components and complex structures

------------------------------------------------------------------------

## Installation

### From npm

``` bash
npm install @joeygrable/strapi-plugin-encrypted-field
```

### From yarn

``` bash
yarn add @joeygrable/strapi-plugin-encrypted-field
```

------------------------------------------------------------------------

## Configuration

### 1. Enable the plugin

Create or edit `config/plugins.js` or `config/plugins.ts`:

``` javascript
module.exports = {
  'encrypted-field': {
    enabled: true,
  },
};
```

### 2. Configure the encryption key (REQUIRED)

#### Option A: Environment variable (recommended)

Add to your `.env`:

``` bash
ENCRYPTION_KEY=your_64_character_hexadecimal_key_here
```

#### Option B: Configuration file

Edit `config/plugins.js`:

``` javascript
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

``` bash
# usine openssl
openssl rand -hex 32

# using node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This generates a 64-character hexadecimal key (32 bytes).

⚠️ **CRITICAL -- Key Management**:

- **Store the key securely** (secret manager, encrypted environment variables)
- **Never** commit it to version control
- **If you lose the key**, you will not be able to decrypt existing data
- **Use the same key** across all environments sharing the same database
- **For production**, consider AWS Secrets Manager, HashiCorp Vault, or similar services

------------------------------------------------------------------------

## Requirements

- **Strapi**: v5.0.0 or higher
- **Node.js**: 10.x -- 24.x
- **npm**: 8.0.0 or higher

------------------------------------------------------------------------

## Data Validation

The plugin supports validation before encryption.

### Configure regex validation

1. In the Content-Type Builder, select the encrypted field
2. Go to the **Advanced Settings** tab
3. In **RegEx pattern**, enter your regular expression
4. Save changes

**Example**:

``` regex
^sk-[a-zA-Z0-9]{32}$
```

If the value does not match the pattern, an error will be thrown before
encryption.

------------------------------------------------------------------------

## Usage

### 1. Add an encrypted field to a collection

1. Go to **Content-Type Builder**
2. Select a collection or create a new one
3. Click **Add another field**
4. Search for **Encrypted Text** (🔒 icon)
5. Configure the field name
6. Save and restart Strapi

### 2. Using the field

- **In the admin panel**: Enter text normally
- **Hidden values**: Displayed as `***` by default
- **Eye button**: Toggle show/hide value
- **Copy button**: Copy value to clipboard with confirmation
- **On save**: Automatically encrypted
- **On read**: Automatically decrypted
- **In the database**: Stored as `iv:authTag:encryptedData`
- **In components**: Works in nested components at any depth

### 3. API Usage

``` bash
# Create with encrypted field
curl -X POST http://localhost:1337/api/users 
  -H "Content-Type: application/json" 
  -d '{
    "data": {
      "name": "Juan",
      "apiKey": "my-secret-key-123"
    }
  }'

# Read (returns decrypted value)
curl -X GET http://localhost:1337/api/users/1
# Response: { "name": "Juan", "apiKey": "my-secret-key-123" }
```

## Example of Usage

### Collection with encrypted API key

**Schema:**

```json
{
  // ...
  "attributes": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "required": true
    },
    "email": {
      "type": "email",
      "minLength": 1,
      "maxLength": 255,
      "required": true
    },
    "api_key": {
      "type": "plugin::encrypted-field.encrypted-text"
    }
  }
  // ...
}
```

**In the database:**

```plaintext
apiKey: "a1b2c3d4e5f6....:f9e8d7c6b5a4....:9f8e7d6c5b4a3..."
```

**In the admin panel and API:**

```plaintext
apiKey: "sk-1234567890abcdef"
```

------------------------------------------------------------------------

## Security & Architecture

### Technical Specifications

- **Algorithm**: AES-256-GCM
- **Key size**: 256 bits (32 bytes, 64 hex characters)
- **IV**: 96 bits (12 bytes), randomly generated per operation
- **Auth Tag**: 128 bits (16 bytes)
- **Storage format**: `iv:authTag:encryptedData`

### Security Features

- ✅ Authenticated encryption (confidentiality + integrity)
- ✅ Unique IV per encryption
- ✅ Tamper detection via Auth Tag
- ✅ Regex validation support
- ✅ **Secure error handling**: Controlled logs without exposing sensitive data

------------------------------------------------------------------------

## Use cases

- 🔑 Third-party API keys
- 🔐 Access tokens
- 🔒 Webhook secrets
- 💳 Sensitive information
- 📧 SMTP credentials
- 🔑 Application passwords

------------------------------------------------------------------------

## Known Limitations

- ❌ **Search**: Cannot search encrypted fields
- ❌ **Sort**: Cannot sort by encrypted fields
- ❌ **Filter**: Cannot filter directly on encrypted fields
- ⚠️ **Performance**: Minimal  overhead (~1--2ms per operation)
- ⚠️ **Synchronization**: All environments sharing a database must use the same key

------------------------------------------------------------------------

## License

MIT © 2026 Get Community, Inc.

------------------------------------------------------------------------

## Developed by

**Get Community, Inc.**
Lead Author: Joey Grable
