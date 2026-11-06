#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from frontend .env if present
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const envFilePath = path.join(projectRoot, '.env');
loadEnvFile(envFilePath);

const isProduction = process.env['NODE_ENV'] === 'production' || process.argv.includes('--production');

const devApiBaseUrl =
  process.env['DEV_API_BASE_URL'] ||
  process.env['API_BASE_URL'] ||
  'http://localhost:8080/api/v1';

const prodApiBaseUrl =
  process.env['PROD_API_BASE_URL'] ||
  process.env['API_BASE_URL'] ||
  'http://localhost:8080/api/v1';

const envDir = path.join(projectRoot, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Generate environment.development.ts
const devEnvContent = `export const environment = {
  production: false,
  apiBaseUrl: '${devApiBaseUrl}',
};
`;

// Generate environment.prod.ts (and environment.ts default based on flag/settings)
const prodEnvContent = `export const environment = {
  production: true,
  apiBaseUrl: '${prodApiBaseUrl}',
};
`;

// Write environments
const targetDefaultContent = isProduction ? prodEnvContent : `export const environment = {
  production: false,
  apiBaseUrl: '${devApiBaseUrl}',
};
`;

fs.writeFileSync(path.join(envDir, 'environment.development.ts'), devEnvContent, 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvContent, 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.ts'), targetDefaultContent, 'utf8');

console.log(`[set-env] Environments generated successfully (mode: ${isProduction ? 'production' : 'development'}).`);
console.log(`[set-env] - Development apiBaseUrl: ${devApiBaseUrl}`);
console.log(`[set-env] - Production apiBaseUrl: ${prodApiBaseUrl}`);

