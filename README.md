# Tea

Tea is a modern, lightweight social media platform designed for real-time interaction. It features post creation with image uploads, likes, comments, follows, notifications, and profile customization, all built with Next.js.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Library:** [React 19](https://react.dev) (featuring React Compiler)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), and [lucide-react](https://lucide.dev)
- **Authentication:** [Clerk](https://clerk.com)
- **Database:** PostgreSQL via [Neon Serverless](https://neon.tech)
- **ORM:** [Prisma v6](https://www.prisma.io)
- **Media Uploads:** [UploadThing](https://uploadthing.com)

---

## Features

- **Secure Authentication:** User signup, login, and profile sync powered by Clerk.
- **Expressive Feed:** Create posts with text and image uploads, view posts chronologically, and delete your own posts.
- **Interactions:** Like/unlike posts, comment on posts, and follow/unfollow other users.
- **Activity Notifications:** Stay updated with real-time notifications for likes, comments, and new followers.
- **Responsive UI & Themes:** A mobile-friendly layout with smooth dark/light mode toggle.

---

## Project Structure

```text
├── prisma/
│   └── schema.prisma                 # Database schema (User, Post, Comment, Like, Follows, Notification)
└── src/
    ├── actions/                      # Server Actions for backend database operations
    │   ├── notification.action.ts    # Notification fetching & marking as read
    │   ├── post.action.ts            # Creating, deleting, retrieving, and commenting on posts
    │   ├── profile.action.ts         # User profiles, updates, and tabs
    │   └── user.action.ts            # Clerk user synchronization and follower management
    ├── app/                          # Next.js App Router folders and static files
    │   ├── about/
    │   │   └── page.tsx              # About page
    │   ├── api/
    │   │   └── uploadthing/
    │   │       ├── core.ts           # File upload handler definition
    │   │       └── route.ts          # API route endpoint for UploadThing
    │   ├── notifications/
    │   │   └── page.tsx              # User notifications feed
    │   ├── profile/
    │   │   └── [username]/
    │   │       ├── not-found.tsx     # Custom user-not-found layout
    │   │       ├── page.tsx          # Dynamic profile route page
    │   │       └── ProfilePageClient.tsx # Client-side interactive profile tabs/content
    │   ├── favicon.ico
    │   ├── globals.css               # App-wide Tailwind configurations
    │   ├── layout.tsx                # Base root layout containing Clerk & Theme providers
    │   └── page.tsx                  # Homepage / Main Feed view
    ├── components/                   # Custom UI controls and templates
    │   ├── CreatePost.tsx            # Form to create new posts
    │   ├── DeleteAlertDialog.tsx     # Generic confirmation dialog for deletion
    │   ├── DesktopNavbar.tsx         # Top navigation links for desktop layouts
    │   ├── FollowButton.tsx          # Toggle button to follow/unfollow users
    │   ├── ImageUpload.tsx           # UploadThing upload trigger component
    │   ├── MobileNavbar.tsx          # Responsive navigation drawer for smaller viewports
    │   ├── ModeToggle.tsx            # Light/Dark mode switcher
    │   ├── Navbar.tsx                # Dynamic top navbar incorporating desktop/mobile versions
    │   ├── NotificationSkeleton.tsx  # Placeholder for loading notifications
    │   ├── PostCard.tsx              # Renders a single post with comments, likes, and actions
    │   ├── Sidebar.tsx               # Left sidebar containing user info / sign-in prompts
    │   ├── theme-provider.tsx        # Next-themes dark mode context wrapper
    │   └── WhoToFollow.tsx           # Right sidebar suggesting random users to follow
    ├── lib/                          # Utility initializations
    │   ├── prisma.ts                 # Prisma Client instantiation wrapper
    │   ├── uploadthing.ts            # UploadThing client hook helper definitions
    │   └── utils.ts                  # Tailwind-merge/clsx helper utility
    └── proxy.ts                      # Local proxy configurations
```

---

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- A PostgreSQL database (e.g., [Neon DB](https://neon.tech))
- A [Clerk](https://clerk.com) account
- An [UploadThing](https://uploadthing.com) account

### Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd tea
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (using `.env.example` as a template):

   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   UPLOADTHING_TOKEN="your-uploadthing-token"
   ```

4. **Initialize the Database:**
   Push the Prisma schema to your live database instance:

   ```bash
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Available Scripts

- `npm run dev` - Runs the app in development mode.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
