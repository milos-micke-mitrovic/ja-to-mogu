# Ja To Mogu

Last-minute accommodation booking platform for Greece, targeting Serbian tourists traveling to Halkidiki and the Olympic region.

## Features

- **Last-minute bookings** - Find and book accommodation for today or tomorrow
- **Multi-role system** - Clients, Owners, Guides, and Admins
- **Journey tracking** - Real-time status updates from departure to arrival
- **Guide assignment** - Local guides to assist travelers
- **Review system** - Rate and review accommodations after your stay
- **Email notifications** - Booking confirmations, journey updates, and more

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl
- **Email**: Resend
- **UI Components**: Custom components based on Radix UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/ja-to-mogu.git
cd ja-to-mogu
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-secret-key"
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="Ja To Mogu <noreply@jatomogu.rs>"
NEXT_PUBLIC_APP_URL="http://localhost:3854"
```

4. Set up the database:
```bash
pnpm prisma generate
pnpm prisma db push
```

5. Seed the database (optional):
```bash
pnpm db:seed
```

6. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3854](http://localhost:3854) in your browser.

## Test Accounts

After seeding, the following test accounts are available (password: `password123`):

| Role | Email | Description |
|------|-------|-------------|
| Admin | admin@jatomogu.rs | Full system access |
| Owner | vlasnik@jatomogu.rs | Accommodation owner |
| Owner | jelena.vlasnik@jatomogu.rs | Second owner |
| Guide | vodic@jatomogu.rs | Field guide |
| Guide | ana.vodic@jatomogu.rs | Second guide |
| Client | klijent@jatomogu.rs | Regular user |
| Client | milica.klijent@jatomogu.rs | Second client |

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── (admin)/        # Admin dashboard
│   │   ├── (client)/       # Client pages
│   │   ├── (guide)/        # Guide dashboard
│   │   ├── (owner)/        # Owner dashboard
│   │   └── (public)/       # Public pages (login, register)
│   └── api/                # API routes
├── components/
│   ├── layouts/            # Layout components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization config
├── lib/                    # Utilities and services
└── messages/               # Translation files
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:seed` - Seed the database
- `pnpm prisma studio` - Open Prisma Studio

## License

Private - All rights reserved
