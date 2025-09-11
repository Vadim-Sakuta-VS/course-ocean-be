import { execSync } from 'child_process';

const command = process.argv[2];
const name = process.argv[3];

if (!name) {
  console.error('Usage: node migration-helper.js <create|generate> <name>');
  process.exit(1);
}

try {
  execSync(
    `npm run typeorm -- migration:${command} ${command === 'generate' ? name : `./src/migrations/${name}`}${command === 'generate' ? ' -d ./src/config/data-source.ts' : ''}`,
    { stdio: 'inherit' },
  );
} catch {
  process.exit(1);
}
