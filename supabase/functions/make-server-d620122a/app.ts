import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createHash } from "node:crypto";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Utility functions
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateAnonName(): string {
  const adjectives = ['Swift', 'Silent', 'Mystic', 'Noble', 'Clever', 'Bold', 'Wise', 'Quick', 'Gentle', 'Brave'];
  const nouns = ['Fox', 'Wolf', 'Eagle', 'Lion', 'Bear', 'Tiger', 'Hawk', 'Owl', 'Raven', 'Falcon'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ANON_${adj}${noun}_${num}`;
}

// Health check endpoint

export { app, kv };
