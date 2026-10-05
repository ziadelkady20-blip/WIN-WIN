# WIN & WIN FRESH BV

Bilingual Dutch/English fresh produce e-commerce platform for the Netherlands.

## Stack
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- PostgreSQL / Neon
- Guest checkout
- Custom admin session auth

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Put your Neon pooled PostgreSQL URL in `DATABASE_URL`.
3. Set a long random `ADMIN_JWT_SECRET`.
4. Set `SEED_ADMIN_PASSWORD`.
5. Install dependencies:

```bash
npm install
```

6. Create/update the Neon schema:

```bash
npm run db:push
```

7. Seed products, categories and the first Super Admin:

```bash
npm run db:seed
```

8. Start development:

```bash
npm run dev
```

Admin:
`/admin`

The seed creates the Super Admin using the values from:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_PASSWORD`

Do not commit `.env.local`.

## Production / Vercel

Add these Vercel environment variables:
- `DATABASE_URL`
- `ADMIN_JWT_SECRET`

Then deploy the Git repository.

Do not run the seed automatically during Vercel builds.
