# Tea

Tea is a modern, lightweight social media platform designed for real-time interaction. It features rich post creation supporting images, multiple-image carousels, GIFs, and polls, along with likes, comments, follows, notifications, and profile customization, all built with Next.js.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Library:** [React 19](https://react.dev) (featuring React Compiler)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), and [lucide-react](https://lucide.dev)
- **Authentication:** [Clerk](https://clerk.com)
- **Database:** PostgreSQL via [Neon Serverless](https://neon.tech)
- **ORM:** [Prisma v6](https://www.prisma.io)
- **Media Uploads:** [UploadThing](https://uploadthing.com)
- **GIFs:** [Giphy API](https://developers.giphy.com)
- **Carousel Animation:** [Embla Carousel](https://www.embla-carousel.com)

---

## Features

- **Secure Authentication:** User signup, login, and profile sync powered by Clerk.
- **Rich Media Post Feed:** Create posts in multiple formats:
  - **Text & Images:** Support for uploading up to 6 images at once.
  - **Carousels:** Multiple images are automatically grouped into an interactive carousel with indicator dots and a fullscreen Lightbox mode.
  - **GIFs:** Integrated GIF search tool using Giphy's API with query search debouncing.
  - **Polls:** Create interactive polls with up to 4 options. Supports vote-swapping and live percentage bars.
- **Interactions:** Like/unlike posts, comment on posts, and follow/unfollow other users.
- **Activity Notifications:** Stay updated with real-time notifications for likes, comments, and new followers.
- **Premium Responsive UI:** A mobile-friendly, high-density layout with smooth dark/light mode toggle, radial environmental gradients, glassmorphism, and responsive micro-animations.

---

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- A PostgreSQL database (e.g., [Neon DB](https://neon.tech))
- A [Clerk](https://clerk.com) account
- An [UploadThing](https://uploadthing.com) account
- A [Giphy Developer](https://developers.giphy.com) API Key

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
   NEXT_PUBLIC_GIPHY_API_KEY="your-giphy-developer-api-key"
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
