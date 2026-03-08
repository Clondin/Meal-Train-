import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const candidatePaths = [
  resolve(process.cwd(), 'openapi.json'),
  resolve(process.cwd(), 'backend/openapi.json'),
];

const openApiPath = candidatePaths.find((candidate) => {
  try {
    readFileSync(candidate, 'utf-8');
    return true;
  } catch {
    return false;
  }
});

if (!openApiPath) {
  throw new Error('Unable to locate backend/openapi.json');
}

export const openApiSpec = JSON.parse(readFileSync(openApiPath, 'utf-8'));
