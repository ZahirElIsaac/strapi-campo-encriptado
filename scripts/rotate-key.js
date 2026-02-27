#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function parseKey(hexKey) {
    if (!hexKey || typeof hexKey !== 'string' || hexKey.length !== 64) {
        throw new Error(`Key must be exactly 64 hexadecimal characters. Got: ${hexKey?.length || 0}`);
    }
    if (!/^[0-9a-fA-F]{64}$/.test(hexKey)) {
        throw new Error('Key must contain only hexadecimal characters (0-9, a-f, A-F)');
    }
    return Buffer.from(hexKey, 'hex');
}

function decryptWithKey(encryptedText, keyBuffer) {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encrypted] = parts;
    if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encryptWithKey(text, keyBuffer) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

async function main() {
    const args = process.argv.slice(2);
    const oldKeyArg = args.find((a) => a.startsWith('--old='));
    const newKeyArg = args.find((a) => a.startsWith('--new='));

    if (!oldKeyArg || !newKeyArg) {
        console.error('Usage: node scripts/rotate-key.js --old=<OLD_KEY> --new=<NEW_KEY>');
        console.error('Keys must be 64-character hexadecimal strings.');
        console.error('\nGenerate a new key with:');
        console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        process.exit(1);
    }

    const oldKey = oldKeyArg.split('=')[1];
    const newKey = newKeyArg.split('=')[1];

    let oldKeyBuffer, newKeyBuffer;
    try {
        oldKeyBuffer = parseKey(oldKey);
        newKeyBuffer = parseKey(newKey);
    } catch (error) {
        console.error(`Key validation error: ${error.message}`);
        process.exit(1);
    }

    if (oldKey === newKey) {
        console.error('Old and new keys are identical. Aborting.');
        process.exit(1);
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (q) => new Promise((resolve) => rl.question(q, resolve));

    console.log('\n🔑 Encrypted Field - Key Rotation Tool');
    console.log('━'.repeat(45));
    console.log('\nThis script reads encrypted values from stdin (one per line),');
    console.log('decrypts them with the OLD key, and re-encrypts with the NEW key.');
    console.log('\nTo use with a database, export the encrypted column values,');
    console.log('pipe them through this script, and update the database.\n');
    console.log('Example with PostgreSQL:');
    console.log('  psql -t -A -c "SELECT id, api_key FROM users WHERE api_key IS NOT NULL" |\\');
    console.log('  while IFS="|" read id val; do');
    console.log('    newval=$(echo "$val" | node scripts/rotate-key.js --old=X --new=Y)');
    console.log('    psql -c "UPDATE users SET api_key=\'$newval\' WHERE id=$id"');
    console.log('  done\n');
    console.log('Paste encrypted values (one per line). Press Ctrl+D when done:\n');

    rl.on('line', (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        try {
            const decrypted = decryptWithKey(trimmed, oldKeyBuffer);
            if (decrypted === null) {
                console.error(`SKIP (not encrypted format): ${trimmed.substring(0, 30)}...`);
                return;
            }
            const reEncrypted = encryptWithKey(decrypted, newKeyBuffer);
            console.log(reEncrypted);
        } catch (error) {
            console.error(`ERROR: ${error.message} | Input: ${trimmed.substring(0, 30)}...`);
        }
    });

    rl.on('close', () => {
        console.error('\n✅ Key rotation complete.');
    });
}

main();
