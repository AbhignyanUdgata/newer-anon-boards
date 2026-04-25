# ANON BOARDS 🛡️
### *Talk here incognito*

An anonymous message board where anyone can post, reply, and interact without revealing their identity. Built with React, Tailwind CSS, shadcn/ui, and powered by Supabase.

---

## Features

- **Anonymous by default** — every visitor gets a unique anonymous ID automatically, no sign up required
- **Optional accounts** — register a username to track your post and reply count across sessions
- **Boards** — posts are organized into topic-based boards, browse all or filter by board
- **Sorting** — sort posts by New, Hot, or Top
- **Threaded replies** — click any post to open a full thread with nested replies
- **Likes** — like posts to push them up the Hot feed
- **Responsive** — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4, shadcn/ui |
| Backend | Supabase Edge Functions (Hono) |
| Database | Supabase (PostgreSQL + KV store) |
| Hosting | GitHub Pages |

---

## Getting Started Locally

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Building for Production

```bash
npm run build
```

Output goes to the `dist/` folder — deploy its contents to any static host.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Root app component
│   │   ├── components/              # UI components
│   │   │   ├── ui/                  # shadcn/ui primitives
│   │   │   ├── BoardCard.tsx        # Post card component
│   │   │   ├── Sidebar.tsx          # Board navigation
│   │   │   ├── ThreadModal.tsx      # Post + replies modal
│   │   │   ├── CreatePostDialog.tsx # New post form
│   │   │   └── AuthModals.tsx       # Login / register forms
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Auth state management
│   │   └── utils/
│   │       └── api.ts               # Supabase API calls
├── supabase/
│   └── functions/server/
│       ├── index.tsx                # Edge function (all API routes)
│       └── kv_store.tsx             # Key-value database helpers
├── utils/supabase/
│   └── info.tsx                     # Project ID + anon key
└── index.html
```

---

## License

UI components from [shadcn/ui](https://ui.shadcn.com/) used under MIT license.
Photos from [Unsplash](https://unsplash.com) used under the Unsplash license.
