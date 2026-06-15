# Aurex

Aurex is a responsive business payments SaaS frontend built with Next.js. It provides a consistent public marketing site, authentication screens, legal pages, and a payments operations dashboard.

The product concept focuses on helping businesses manage payments, invoices, settlements, reconciliation, cash flow, team access, and secure financial operations from one workspace.

## Features

- Responsive SaaS landing page
- About, features, pricing, security, and contact pages
- Sign in, sign up, and password recovery screens
- Privacy policy and terms of service layouts
- Business payments dashboard
- Semantic light and dark theme tokens
- Reusable public-page, form, card, button, and CTA components
- Subtle animations powered by Motion
- Accessible labels, headings, navigation, and form controls

## Routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing page |
| `/about` | Company mission and values |
| `/features` | Product capabilities |
| `/pricing` | Starter, Growth, and Enterprise plans |
| `/security` | Security and operational controls |
| `/contact` | Sales and support contact form |
| `/signin` | Sign-in screen |
| `/signup` | Account creation screen |
| `/forgot-password` | Password recovery screen |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/dashboard` | Payments operations dashboard |

## Technology

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for animations
- [Radix UI](https://www.radix-ui.com/)
- [Lucide React](https://lucide.dev/) and React Icons
- Class Variance Authority for component variants

## Getting Started

### Requirements

- Node.js 20 or later
- npm

### Installation

```bash
git clone <repository-url>
cd aurex
npm install
```

The current frontend does not require environment variables to run. Add local
values to `.env.local` if backend integrations are introduced later.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # Start the development server
npm run lint    # Run ESLint
npm run build   # Create a production build
npm run start   # Run the production server
```

Run TypeScript validation directly with:

```bash
npx tsc --noEmit
```

## Project Structure

```text
app/                  Route pages, layouts, and global styles
components/public/    Shared marketing, authentication, and legal layouts
components/ui/        Reusable UI primitives
features/home/        Landing-page sections
features/motion/      Motion experiments and examples
public/               Static images and media
lib/                  Shared utilities
```

## Styling

The interface uses semantic theme classes defined in `app/globals.css`, including:

- `bg-background` and `text-foreground`
- `bg-card` and `text-card-foreground`
- `bg-muted` and `text-muted-foreground`
- `border-border`
- `bg-primary` and `text-primary-foreground`
- `bg-secondary` and `text-secondary-foreground`

Prefer these tokens over hardcoded UI colors. Hardcoded colors should be limited to brand artwork, logos, or deliberate decorative illustrations.

## Current Scope

This repository currently implements the frontend experience. Authentication, form submission, payments, dashboard records, and account actions use static UI data and are not connected to a backend.

Before production use, add server-side validation, authentication, authorization, persistent storage, payment-provider integration, monitoring, and reviewed legal policies.
