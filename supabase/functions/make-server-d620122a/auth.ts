// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

app.get("/make-server-d620122a/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// USER AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post("/make-server-d620122a/auth/register", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400);
    }

    // Check if user exists
    const existingUser = await kv.get(`user:${username}`);
    if (existingUser) {
      return c.json({ error: 'Username already exists' }, 400);
    }

    const userId = generateId();
    const anonId = generateAnonName();
    const isDefaultAdmin = username === 'Abhignyan1103';
    const user = {
      id: userId,
      username,
      passwordHash: hashPassword(password),
      anonId,
      isAdmin: isDefaultAdmin,
      isModerator: isDefaultAdmin,
      createdAt: Date.now(),
      postCount: 0,
      replyCount: 0,
      avatar: isDefaultAdmin ? '🛡️' : ['🦊', '🐺', '🦅', '🦁', '🐻'][Math.floor(Math.random() * 5)]
    };

    await kv.set(`user:${username}`, user);
    await kv.set(`userId:${userId}`, username);

    return c.json({ success: true, user: { ...user, passwordHash: undefined } });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Login user
app.post("/make-server-d620122a/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400);
    }

    let user = await kv.get(`user:${username}`);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Always ensure Abhignyan1103 has admin+mod privileges
    if (username === 'Abhignyan1103' && (!user.isAdmin || !user.isModerator)) {
      user = { ...user, isAdmin: true, isModerator: true, avatar: '🛡️' };
      await kv.set(`user:${username}`, user);
    }

    return c.json({ success: true, user: { ...user, passwordHash: undefined } });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-d620122a/auth/profile/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const user = await kv.get(`user:${username}`);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: { ...user, passwordHash: undefined } });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});
