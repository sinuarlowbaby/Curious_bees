import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env file absolutely
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NEXT_PUBLIC_DEVELOPMENT_MODE: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_AUTH_MODE: z.enum(['bypass', 'firebase']).default('bypass'),
  NEXT_PUBLIC_DEV_ROLE: z.enum(['RESEARCH_SCHOLAR', 'RESEARCH_SUPERVISOR', 'INSTITUTION_ADMIN']).default('RESEARCH_SCHOLAR'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
}).refine((data) => {
  const isBypass = data.NEXT_PUBLIC_AUTH_MODE === 'bypass' || data.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true';
  if (!isBypass) {
    return (
      !!data.NEXT_PUBLIC_SUPABASE_URL &&
      !!data.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !!data.NEXT_PUBLIC_FIREBASE_API_KEY &&
      !!data.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      !!data.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
  }
  return true;
}, {
  message: 'Supabase URL, Anon Key, and Firebase Client credentials are required when AUTH_MODE is firebase',
});

// Run validation at config load time (startup/build)
const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('\n❌ Frontend environment validation failed:');
  result.error.errors.forEach((err) => {
    console.error(`  - [${err.path.join('.') || 'Global'}]: ${err.message}`);
  });
  console.error('');
  process.exit(1);
}

const nextConfig = {
  env: {},
  transpilePackages: ['@curiousbees/ui', '@curiousbees/constants'],
};

export default nextConfig;