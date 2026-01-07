# African Creator Impact Awards (ACIA) - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Role System](#authentication--role-system)
6. [Voting & Payment Flow](#voting--payment-flow)
7. [User Journeys](#user-journeys)
8. [Edge Functions](#edge-functions)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)
11. [Security Considerations](#security-considerations)
12. [Maintenance & Scaling](#maintenance--scaling)

---

## Project Overview

The **African Creator Impact Awards (ACIA)** is a full-stack web application designed to celebrate and recognize Africa's most influential digital creators. The platform enables:

- **Public users** to browse nominees, view galleries, and vote for their favorite creators
- **Creators/Nominees** to register, manage their profiles, track votes, and share voting campaigns
- **Admins/Superadmins** to manage creators, categories, gallery images, and oversee the platform

### Key Features
- Creator registration and profile management
- M-Pesa payment integration for voting (KES 10 per vote)
- Real-time leaderboard and rankings
- Gallery showcase with carousel
- Admin dashboard for content management
- Role-based access control (RBAC)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **State Management** | TanStack React Query |
| **Routing** | React Router DOM v6 |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Media Storage** | Cloudinary CDN (unsigned uploads) |
| **Payments** | Lipana M-Pesa STK Push |
| **Validation** | Zod |
| **Icons** | Lucide React |

### Cloudinary Configuration
All image uploads (profile photos, gallery images) are handled via Cloudinary:
- **Cloud Name**: `dhsihufoq`
- **Upload Preset**: `Nominees` (unsigned)
- Images are automatically optimized for performance with lazy loading
- URLs stored in Supabase database only (no blob storage in Supabase)

---

## Folder Structure

```
├── public/                     # Static assets
│   ├── acia-favicon.png       # ACIA favicon
│   ├── acia-og-image.png      # Open Graph image for social sharing
│   └── robots.txt             # SEO robots file
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── Footer.tsx        # Site footer
│   │   ├── GalleryCarousel.tsx # Homepage gallery carousel
│   │   ├── HeroSection.tsx   # Homepage hero section
│   │   ├── Logo.tsx          # ACIA logo component
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── NomineeCard.tsx   # Nominee display card
│   │   └── VoteModal.tsx     # Voting modal with M-Pesa
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts        # Authentication & role hooks
│   │   └── useCreators.ts    # Creators/Categories data hooks
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client instance
│   │       └── types.ts      # Auto-generated DB types
│   ├── lib/
│   │   ├── cloudinary.ts     # Cloudinary upload & optimization utilities
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   ├── pages/                 # Route pages
│   │   ├── Index.tsx         # Homepage
│   │   ├── Auth.tsx          # Login/Signup
│   │   ├── Nominees.tsx      # All nominees listing
│   │   ├── NomineeProfile.tsx # Individual nominee page
│   │   ├── CreatorDashboard.tsx # Creator's dashboard
│   │   ├── CreatorProfile.tsx # Creator profile editor
│   │   ├── CreatorTips.tsx   # Campaign tips
│   │   ├── DashboardRankings.tsx # Rankings within dashboard
│   │   ├── AdminDashboard.tsx # Admin panel
│   │   ├── Leaderboard.tsx   # Public leaderboard
│   │   ├── Gallery.tsx       # Full gallery page
│   │   └── ...               # About, Contact, Terms, Privacy, 404
│   ├── App.tsx               # Main app with routes
│   ├── index.css             # Global styles & design tokens
│   └── main.tsx              # Entry point
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── functions/            # Edge Functions
│   │   ├── assign-creator-role/
│   │   ├── bootstrap-superadmin/
│   │   ├── check-payment-status/
│   │   ├── initiate-payment/
│   │   └── lipana-webhook/
│   └── migrations/           # Database migrations
└── index.html                # HTML entry with OG meta tags
```

---

## Database Schema

### Tables

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | Creation timestamp |

#### `creators`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Auth user reference |
| full_name | TEXT | Creator's full name |
| alias | TEXT | Username/handle |
| email | TEXT | Contact email |
| phone | TEXT | Phone number |
| category_id | UUID | FK to categories |
| bio | TEXT | Biography |
| profile_photo_url | TEXT | Profile image URL |
| vote_count | INTEGER | Total votes received |
| is_approved | BOOLEAN | Admin approval status |
| is_active | BOOLEAN | Active status |
| instagram_url | TEXT | Social link |
| twitter_url | TEXT | Social link |
| youtube_url | TEXT | Social link |
| tiktok_url | TEXT | Social link |
| website_url | TEXT | Website URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update |

#### `votes`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| creator_id | UUID | FK to creators |
| voter_ip | TEXT | Voter's IP (optional) |
| created_at | TIMESTAMP | Vote timestamp |

#### `payments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| creator_id | UUID | FK to creators |
| phone_number | TEXT | M-Pesa phone |
| amount | INTEGER | Payment amount (KES) |
| votes_expected | INTEGER | Votes to add |
| payment_status | TEXT | pending/completed/failed |
| checkout_id | TEXT | M-Pesa checkout ID |
| reference | TEXT | Payment reference |
| lipana_response | JSONB | Raw API response |
| created_at | TIMESTAMP | Created |
| updated_at | TIMESTAMP | Updated |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Auth user ID |
| role | ENUM | superadmin/admin/creator |
| created_at | TIMESTAMP | Assigned timestamp |

#### `gallery`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| image_url | TEXT | Image URL |
| title | TEXT | Image title |
| description | TEXT | Description |
| is_active | BOOLEAN | Visibility |
| created_at | TIMESTAMP | Upload timestamp |

### Row-Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Categories**: Public read, admin write
- **Creators**: Public read (approved only), creator can update own, admin full access
- **Votes**: Public insert/read, admin full access
- **Payments**: Public insert/read, service role update, admin full access
- **User Roles**: User can read own, admin full access
- **Gallery**: Public read (active only), admin full access

---

## Authentication & Role System

### Authentication Flow
1. User signs up with email/password via Supabase Auth
2. Email confirmation sent (configurable)
3. Upon confirmation, user can sign in
4. User is redirected based on role:
   - Superadmin/Admin → Admin Dashboard
   - Creator → Creator Dashboard
   - No role → Creator Registration

### Role Types
| Role | Permissions |
|------|-------------|
| **superadmin** | Full system access, manage admins |
| **admin** | Manage creators, categories, gallery |
| **creator** | Manage own profile, view stats |

### Superadmin Bootstrap
- Email: `awardsacia@gmail.com`
- Automatically granted superadmin role on first login via `bootstrap-superadmin` edge function

### Role Checking
```typescript
const { isAdmin, isSuperAdmin, isCreator } = useUserRole(user?.id);
```

---

## Voting & Payment Flow

### Vote Pricing
- **1 vote = KES 10**
- Users can purchase multiple votes at once

### Payment Process
1. User clicks "Vote" on a nominee
2. Modal opens with phone number and vote quantity inputs
3. User submits → `initiate-payment` edge function called
4. M-Pesa STK push sent to user's phone
5. User enters PIN on phone
6. Webhook (`lipana-webhook`) receives payment confirmation
7. Votes added to creator's `vote_count`
8. Payment status updated

### Payment States
- `pending`: Awaiting M-Pesa confirmation
- `completed`: Payment successful, votes added
- `failed`: Payment failed or cancelled

---

## User Journeys

### Public User
1. Visit homepage → View featured nominees
2. Browse all nominees → Filter by category
3. View nominee profile → See stats, bio, social links
4. Vote for nominee → Enter phone, complete M-Pesa payment
5. Share nominee link with friends

### Creator/Nominee
1. Sign up → Complete registration form
2. Await admin approval
3. Once approved → Access Creator Dashboard
4. View stats: votes, rank, earnings (KES 6/vote)
5. Share voting link for campaign
6. Update profile and social links

### Admin/Superadmin
1. Sign in → Redirect to Admin Dashboard
2. Review pending creator registrations
3. Approve/reject creators
4. Manage categories (add, delete)
5. Manage gallery images (upload, toggle visibility, delete)
6. View all creators and their stats

---

## Edge Functions

### `initiate-payment`
- Initiates M-Pesa STK Push via Lipana API
- Creates payment record in database
- Returns checkout ID for status polling

### `check-payment-status`
- Polls payment status from database
- Returns current status for frontend polling

### `lipana-webhook`
- Receives M-Pesa payment callbacks
- Updates payment status
- Increments creator vote count on success

### `assign-creator-role`
- Assigns 'creator' role to user after registration
- Called after creator profile creation

### `bootstrap-superadmin`
- Creates superadmin role for designated email
- Called on first admin login

---

## Environment Variables

### Required in Supabase Dashboard

| Variable | Description |
|----------|-------------|
| `LIPANA_API_KEY` | Lipana M-Pesa API key |
| `LIPANA_API_SECRET` | Lipana API secret |
| `SUPABASE_URL` | Auto-configured |
| `SUPABASE_ANON_KEY` | Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configured |

### Frontend (.env - not committed)
No frontend environment variables needed - Supabase config is in `client.ts`

---

## Deployment

### Frontend (Lovable/Netlify)
1. Push to connected repository
2. Auto-deploy triggers on push
3. Custom domain configured in project settings

### Backend (Supabase)
- Edge functions deploy automatically on push
- Database migrations require manual approval in Lovable
- Storage buckets: `profile-photos` for images

### DNS Configuration (Custom Domain)
1. Add CNAME record pointing to Lovable subdomain
2. Configure in Project Settings → Domains

### Post-Deployment Checklist
- [ ] Enable leaked password protection in Supabase Auth settings
- [ ] Verify M-Pesa webhook URL is correctly configured
- [ ] Test payment flow end-to-end
- [ ] Confirm email templates are customized
- [ ] Set up backup schedule for database

---

## Security Considerations

### Implemented
✅ Row-Level Security on all tables
✅ Role-based access control via separate `user_roles` table
✅ Server-side role validation (never client-side only)
✅ Secure password hashing via Supabase Auth
✅ HTTPS enforcement
✅ Input validation with Zod schemas
✅ Sanitized database queries via Supabase client

### Recommendations
⚠️ Enable "Leaked Password Protection" in Supabase Auth settings
⚠️ Set up rate limiting for voting API
⚠️ Implement CAPTCHA for registration
⚠️ Add audit logging for admin actions
⚠️ Regular security audits of RLS policies

### Critical Security Notes
- **Never store roles in localStorage** - always fetch from database
- **Always validate roles server-side** - edge functions use service role
- **Superadmin email is hardcoded** - change only with caution

---

## Maintenance & Scaling

### Regular Maintenance
- Monitor payment webhook logs for failures
- Review pending creator approvals weekly
- Backup database before major updates
- Update dependencies monthly

### Scaling Considerations

#### Database
- Add indexes on frequently queried columns (`vote_count`, `created_at`)
- Consider partitioning `votes` table if volume exceeds 10M records
- Upgrade Supabase instance size for high traffic

#### Storage
- Implement image compression for uploads
- Consider CDN for static assets
- Set up lifecycle rules for unused images

#### Performance
- Enable connection pooling in Supabase
- Implement caching for leaderboard data
- Consider Redis for real-time vote counts

### Future Enhancements
- Real-time vote updates via Supabase Realtime
- Push notifications for creators
- Multiple voting rounds/seasons
- Social login (Google, Twitter)
- Mobile app version
- Advanced analytics dashboard

---

## Support

For technical support or questions:
- **Email**: awardsacia@gmail.com
- **Documentation**: This file
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qprtljmxfulproevgydc

---

*Last updated: January 2026*
*Version: 1.0.0*
