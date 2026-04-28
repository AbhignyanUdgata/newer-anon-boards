// ============================================================
// ANON BOARDS — Edge Function Entry Point
// Import each route module (order matters for Hono routing)
// ============================================================

import "./auth.ts";
import "./posts.ts";
import "./replies.ts";
import "./boards.ts";
import "./reports.ts";
import "./moderation.ts";

import { app } from "./app.ts";

Deno.serve(app.fetch);
