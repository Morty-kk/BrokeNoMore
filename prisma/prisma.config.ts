import { defineConfig } from '@prisma/integration';

export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL,
  },
});
