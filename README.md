# Aurex

Aurex is a responsive business operations frontend built with Next.js. It
combines a public product site with authenticated workspaces for managing
business access, employees, invitations, notifications, and payment-related
operations.

The frontend consumes a separate Aurex backend configured through
`NEXT_PUBLIC_BACKEND_URL`.

## Implemented Features

- Responsive marketing, product, pricing, security, legal, and contact pages
- Registration, login, email verification, password recovery, and session
  management
- Homepage and CTA email handoff into the authentication flow
- Business creation, switching, profile-image uploads, and permission-aware
  navigation
- Business members with role and status management
- Searchable, type-filtered, collapsible system and custom role management
- Member and employee invitations, received invitations, approval workflows,
  membership outcomes, and notifications
- Employee lists, employee creation and editing, bank-account verification,
  and verification status tracking
- Business-owned employee types and groups, including backend-provided system
  templates, custom classifications, archived historical labels, and
  permission-aware assignment
- Employee policy categories, effective policies, structured assignment rules,
  manual overrides, resolution explanations, reconciliation, and audit history
- Consistent loading, error, empty, pagination, dialog, and toast states
- Semantic light and dark themes with responsive, accessible controls

Payments, invoices, providers, and business audit logs currently retain their
integration-ready screens while their remaining backend contracts are added.

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing page |
| `/about` | Company mission and values |
| `/features` | Product capabilities |
| `/pricing` | Product plans |
| `/security` | Security and operational controls |
| `/contact` | Sales and support contact form |
| `/login` | Account login |
| `/register` | Account registration |
| `/verify-email` | Email verification |
| `/forgot-password` | Password recovery |
| `/reset-password` | Password reset |
| `/dashboard` | Authenticated dashboard |
| `/dashboard/invites` | Received invitations |
| `/dashboard/notifications` | User notifications |
| `/dashboard/settings` | Account and session settings |
| `/business/:businessId` | Business workspace |
| `/business/:businessId/members` | Member management |
| `/business/:businessId/roles` | Role management |
| `/business/:businessId/invites` | Sent invitations and approvals |
| `/business/:businessId/employee-lists` | Employee lists and employees |

## Technology

- [Next.js 16](https://nextjs.org/) App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TanStack Query](https://tanstack.com/query/latest) for server state
- [Axios](https://axios-http.com/) for API requests
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Motion](https://motion.dev/)
- [Lucide React](https://lucide.dev/) and React Icons
- [Vitest](https://vitest.dev/)

## Getting Started

### Requirements

- Node.js 20 or later
- npm
- A running Aurex backend

### Installation

```bash
git clone <repository-url>
cd aurex
npm install
```

Copy `.env.example` to `.env.local` and configure the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.example.com
```

Business profile-image uploads also require the Cloudinary cloud name and an
unsigned upload preset listed in `.env.example`. Restrict the preset to JPEG,
PNG, and WebP files, enforce a 5 MB maximum, and constrain its destination
folder and allowed origins.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint       # ESLint
npm test           # Vitest suite
npx tsc --noEmit   # TypeScript validation
npm run build      # Production build
```

## Project Structure

```text
app/                  Route pages, layouts, and global styles
components/           Shared product and UI components
features/access/      Roles, invitations, approvals, and notifications
features/auth/        Authentication flows
features/business/    Businesses, members, employee lists, and classifications
features/dashboard/   Authenticated workspace shell and section views
features/home/        Landing-page sections
lib/                  API clients and shared utilities
public/               Product assets used by the application
types/                Shared frontend types
```

## API and Security Notes

Permission checks in the interface improve the user experience, while backend
authorization remains authoritative. Employee classification templates are
resolved through the backend before employee records receive business-owned
type or group IDs.

The public contact and newsletter forms post to `/contact` and
`/newsletter/subscribe` on `NEXT_PUBLIC_BACKEND_URL`.

Before production use, verify server-side validation, authentication,
authorization, CSRF protections, cookie attributes, persistent storage,
payment-provider integration, monitoring, and reviewed legal policies in the
backend deployment.
