const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  fs.writeFileSync('tsc-output.txt', 'SUCCESS\n' + output);
} catch (error) {
  fs.writeFileSync('tsc-output.txt', 'FAILED\n' + error.stdout + '\n' + error.stderr);
}
