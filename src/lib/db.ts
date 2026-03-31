import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://prompt-bibliotheek-infojongsma-wq.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
