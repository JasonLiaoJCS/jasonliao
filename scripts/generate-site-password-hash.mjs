import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function toBase64Url(buffer){
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function main(){
  const rl = createInterface({ input, output });
  const password = (await rl.question('Password to hash: ')).trim();
  rl.close();

  if(!password){
    console.error('Password cannot be empty.');
    process.exit(1);
  }

  const iterations = 210000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const encoded = `pbkdf2_sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(hash)}`;

  console.log('\nCopy exactly the next line only:\n');
  console.log(encoded);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
