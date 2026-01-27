import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from './collections/Users';
import { Tenants } from './collections/Tenants';
import { Courses } from './collections/Courses';
import { Modules } from './collections/Modules';
import { Lessons } from './collections/Lessons';
import { Media } from './collections/Media';
import { StorageConfigs } from './collections/StorageConfigs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Learning Hall',
    },
  },
  collections: [
    Users,
    Tenants,
    Courses,
    Modules,
    Lessons,
    Media,
    StorageConfigs,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true, // Auto-sync schema to database on startup
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  serverURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  cors: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ],
});
