# WIN & WIN FRESH BV

Premium bilingual Dutch/English fresh produce e-commerce website and admin dashboard.

## Stack
- Next.js
- TypeScript
- Drizzle ORM
- PostgreSQL / Neon
- Tailwind CSS

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

Do not commit production secrets. Configure `DATABASE_URL` and admin secrets through environment variables.
