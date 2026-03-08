const optionalOauthEnvKeys = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
] as const;

const requiredProductionEnvKeys = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SENDGRID_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'FRONTEND_URL',
] as const;

export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is required`);
  }

  return value;
};

export const getJwtSecret = () => getRequiredEnv('JWT_SECRET');

export function validateStartupEnv(logger: Pick<Console, 'warn'> = console): void {
  if (!isProduction()) {
    return;
  }

  const missing = requiredProductionEnvKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.SENDGRID_API_KEY?.startsWith('SG.')) {
    throw new Error('SENDGRID_API_KEY must start with SG.');
  }

  const missingOptional = optionalOauthEnvKeys.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    logger.warn(
      `Optional OAuth environment variables are missing: ${missingOptional.join(', ')}`
    );
  }
}
