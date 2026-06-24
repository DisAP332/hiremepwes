# Prisma 7 downgrade fix

This project currently uses the Prisma 6 schema style:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

That is intentional for the fastest setup path. Prisma 7 moved datasource URLs into `prisma.config.ts`, which is why `latest` broke the project.

Use Prisma 6.19.3 for both `prisma` and `@prisma/client`.

## Fix commands

```bash
npm install prisma@6.19.3 @prisma/client@6.19.3 --save-exact
npm run prisma:version
npm run prisma:generate
npm run prisma:migrate
```

If your lockfile keeps forcing Prisma 7, reset it:

```bash
rm -rf node_modules package-lock.json
npm install
npm run prisma:version
```

You should see Prisma CLI Version 6.19.3.
