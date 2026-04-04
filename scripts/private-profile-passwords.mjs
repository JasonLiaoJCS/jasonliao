#!/usr/bin/env node

import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const PBKDF2_ITERATIONS = 600000;
const PBKDF2_KEY_LENGTH = 32;
const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 16;
const PAYLOAD_PREFIX = 'window.PRIVATE_PROFILE_PAYLOAD=';
const PASSWORD_SEPARATOR = '||';

function parsePasswordList(value){
  if(!value) return [];
  return [...new Set(
    value
      .split(PASSWORD_SEPARATOR)
      .map(password => password.trim())
      .filter(Boolean),
  )];
}

function parsePayloadSource(source){
  const trimmed = source.trim();
  if(!trimmed.startsWith(PAYLOAD_PREFIX)){
    throw new Error('private-data.js does not contain a recognizable PRIVATE_PROFILE_PAYLOAD assignment.');
  }

  let json = trimmed.slice(PAYLOAD_PREFIX.length);
  if(json.endsWith(';')){
    json = json.slice(0, -1);
  }
  return JSON.parse(json);
}

function serializePayload(payload){
  return `${PAYLOAD_PREFIX}${JSON.stringify(payload)};\n`;
}

function getPayloadEntries(payload){
  if(Array.isArray(payload?.entries) && payload.entries.length){
    return payload.entries;
  }
  return payload ? [payload] : [];
}

function decryptEntry(entry, password){
  const encrypted = Buffer.from(entry.data, 'base64');
  const ciphertext = encrypted.subarray(0, encrypted.length - AES_GCM_TAG_LENGTH);
  const authTag = encrypted.subarray(encrypted.length - AES_GCM_TAG_LENGTH);
  const key = pbkdf2Sync(password, Buffer.from(entry.salt, 'base64'), entry.iterations, PBKDF2_KEY_LENGTH, 'sha256');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(entry.iv, 'base64'));
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

function decryptPayload(payload, password){
  for(const entry of getPayloadEntries(payload)){
    try {
      return decryptEntry(entry, password);
    } catch {
      // Try the next valid-password slot.
    }
  }
  return null;
}

function encryptPayload(data, password){
  const salt = randomBytes(16);
  const iv = randomBytes(AES_GCM_IV_LENGTH);
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(data), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iterations: PBKDF2_ITERATIONS,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: Buffer.concat([ciphertext, authTag]).toString('base64'),
  };
}

function promptVisible(question){
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptHidden(question){
  if(!process.stdin.isTTY || !process.stdout.isTTY){
    return promptVisible(question);
  }

  return new Promise(resolve => {
    const stdin = process.stdin;
    let answer = '';

    const cleanup = () => {
      stdin.removeListener('keypress', onKeypress);
      if(stdin.isTTY){
        stdin.setRawMode(false);
      }
      stdin.pause();
    };

    const onKeypress = (input, key = {}) => {
      if(key.ctrl && key.name === 'c'){
        cleanup();
        process.stdout.write('\n');
        process.exit(130);
      }

      if(key.name === 'return' || key.name === 'enter'){
        cleanup();
        process.stdout.write('\n');
        resolve(answer.trim());
        return;
      }

      if(key.name === 'backspace'){
        answer = answer.slice(0, -1);
        return;
      }

      if(typeof input === 'string' && input){
        answer += input;
      }
    };

    readline.emitKeypressEvents(stdin);
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('keypress', onKeypress);
  });
}

async function collectTargetPasswords(initialPasswords){
  if(initialPasswords.length){
    return initialPasswords;
  }

  console.log('');
  console.log('Enter the passwords that should remain valid after the rewrite.');
  console.log(`Tip: to add a password and keep the current one, enter both as target passwords. Leave blank when done.`);

  const targetPasswords = [];
  while(true){
    const password = await promptHidden(`Target password #${targetPasswords.length + 1}: `);
    if(!password){
      if(targetPasswords.length){
        break;
      }
      console.log('At least one target password is required.');
      continue;
    }

    if(targetPasswords.includes(password)){
      console.log('That password is already in the target list.');
      continue;
    }

    targetPasswords.push(password);
  }

  return targetPasswords;
}

async function main(){
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const payloadPath = process.env.PRIVATE_PROFILE_PAYLOAD_PATH || path.join(repoRoot, 'private-data.js');
  const outputPath = process.env.PRIVATE_PROFILE_OUTPUT_PATH || payloadPath;
  const source = await fs.readFile(payloadPath, 'utf8');
  const payload = parsePayloadSource(source);

  const currentPasswords = parsePasswordList(
    process.env.PRIVATE_PROFILE_CURRENT_PASSWORDS || process.env.PRIVATE_PROFILE_CURRENT_PASSWORD || '',
  );
  const targetPasswordsFromEnv = parsePasswordList(process.env.PRIVATE_PROFILE_TARGET_PASSWORDS || '');

  let privateProfileData = null;
  for(const password of currentPasswords){
    privateProfileData = decryptPayload(payload, password);
    if(privateProfileData) break;
  }

  while(!privateProfileData){
    const currentPassword = await promptHidden('Current valid password: ');
    if(!currentPassword){
      console.log('A current valid password is required.');
      continue;
    }

    privateProfileData = decryptPayload(payload, currentPassword);
    if(!privateProfileData){
      console.log('Could not decrypt the current private profile. Please try again.');
    }
  }

  const targetPasswords = await collectTargetPasswords(targetPasswordsFromEnv);
  const rewrittenPayload = {
    version: 2,
    entries: targetPasswords.map(password => encryptPayload(privateProfileData, password)),
  };

  await fs.writeFile(outputPath, serializePayload(rewrittenPayload), 'utf8');

  console.log('');
  console.log(`Updated ${path.basename(outputPath)} with ${targetPasswords.length} valid password(s).`);
  if(path.resolve(outputPath) !== path.resolve(payloadPath)){
    console.log(`Source payload: ${payloadPath}`);
    console.log(`Output payload: ${outputPath}`);
  }
  console.log('Remember to commit and push the regenerated private-data.js file if you want the new passwords to apply on the live site.');
}

main().catch(error => {
  console.error('');
  console.error(error.message || error);
  process.exit(1);
});
