const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏁 Starting CuriousBees V2 Complete Setup...\n');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

const execOptions = {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
  }
};

try {
  // 1. Validate Environment Variables
  console.log('🔐 [1/4] Validating root environment configuration...');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: Root .env file is missing!');
    console.error('Please run: cp .env.example .env');
    process.exit(1);
  }
  
  // Load dotenv
  require('dotenv').config({ path: envPath });
  
  const requiredEnv = ['DATABASE_URL', 'DIRECT_URL', 'NEXT_PUBLIC_API_URL'];
  let hasErrors = false;
  requiredEnv.forEach((key) => {
    const val = process.env[key];
    if (!val) {
      console.error(`❌ Error: Required environment variable "${key}" is missing in root .env`);
      hasErrors = true;
    } else {
      try {
        new URL(val);
      } catch (err) {
        console.error(`❌ Error: Environment variable "${key}" is not a valid URL: "${val}"`);
        hasErrors = true;
      }
    }
  });
  
  if (hasErrors) {
    process.exit(1);
  }
  console.log('✅ Environment variables validated successfully.');

  // 2. Generate Prisma Database Client
  console.log('\n📦 [2/4] Generating Prisma database client...');
  execSync('npx prisma generate --schema=apps/api/prisma/schema.prisma', execOptions);

  // 3. Build Shared Packages
  console.log('\n🏗️ [3/4] Compiling and building shared packages...');
  execSync('npx tsc -b packages/types packages/shared-utils packages/constants', execOptions);

  // 4. Run Diagnostic Checks (Doctor)
  console.log('\n🩺 [4/4] Invoking system doctor diagnostics...');
  execSync('npm run doctor', execOptions);

  console.log('\n✅ Setup completed successfully! All dependencies installed, packages built, and connections verified.');
  console.log('💡 To start the development servers, run: npm run dev');
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
