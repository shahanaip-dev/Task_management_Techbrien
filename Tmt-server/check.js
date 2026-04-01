const { execSync } = require('child_process');
try {
  execSync('npx tsc', { stdio: 'pipe' });
  console.log('Success');
} catch (e) {
  require('fs').writeFileSync('out.txt', e.stdout.toString() + '\n' + e.stderr.toString());
  console.log('Error logged to out.txt');
}
