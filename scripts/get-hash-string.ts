import readline from 'readline';
import bcrypt from 'bcrypt';
import { loadDotenv } from '../src/common/utils/dotenv';

loadDotenv();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter value to get hash: ', async (value) => {
  const hash = await bcrypt.hash(value, Number(process.env.BCRYPT_HASH_SALT));
  console.log(hash);

  rl.close();
});
