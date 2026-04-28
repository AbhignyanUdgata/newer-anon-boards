// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

// ============================================
// MODERATION ROUTES
// ============================================

// Helper to check if user is moderator — Abhignyan1103 is always mod
async function isMod(username: string): Promise<boolean> {
  if (!username) return false;
  if (username === 'Abhignyan1103') return true;
  const user = await kv.get(`user:${username}`).catch(() => null);
  return !!(user?.isAdmin || user?.isModerator);
}

// Get all reports grouped by post (mods only)
app.get("/make-server-d620122a/moderation/reports", async (c) => {
  try {
    const username = c.req.query('username');
    if (!await isMod(username || '')) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const status = c.req.query('status') || 'pending';
    const allReports = await kv.getByPrefix('report:');

    // Filter by status
    const filtered = allReports.filter((r: any) =>
      status === 'all' || r.status === status
    );

    // Group by postId so mod sees all reports for a post together
    const grouped: Record<string, any> = {};
    for (const r of filtered) {
      if (!grouped[r.postId]) {
        // Fetch post to get current content & hidden status
        const post = await kv.get(`post:${r.postId}`).catch(() => null);
        grouped[r.postId] = {
          postId: r.postId,
          postTitle: r.postTitle,
          postContent: r.postContent || post?.content || '',
          postAnonId: r.postAnonId,
          isHidden: post?.isHidden || false,
          reportCount: post?.reportCount || 1,
          reports: [],
          latestReportAt: 0,
          status: r.status,
        };
      }
      grouped[r.postId].reports.push(r);
      if (r.createdAt > grouped[r.postId].latestReportAt) {
        grouped[r.postId].latestReportAt = r.createdAt;
      }
    }

    const groups = Object.values(grouped).sort(
      (a: any, b: any) => b.latestReportAt - a.latestReportAt
    );

    return c.json({ reports: groups });
  } catch (error) {
    console.error('Get reports error:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// Remove post (delete) — mods only
app.post("/make-server-d620122a/moderation/posts/:postId/remove", async (c) => {
  try {
    const postId = c.req.param('postId');
    const { username } = await c.req.json();

    if (!await isMod(username)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const post = await kv.get(`post:${postId}`);
    if (post) {
      await kv.del(`post:${postId}`);
    }

    // Mark all reports for this post as reviewed
    const allReports = await kv.getByPrefix('report:');
    for (const r of allReports) {
      if (r.postId === postId && r.status === 'pending') {
        await kv.set(`report:${r.id}`, { ...r, status: 'reviewed', reviewedBy: username, reviewedAt: Date.now(), action: 'removed' });
      }
    }

    return c.json({ success: true, message: 'Post removed' });
  } catch (error) {
    console.error('Remove post error:', error);
    return c.json({ error: 'Failed to remove post' }, 500);
  }
});

// Dismiss all reports for a post (keep post, unhide if hidden) — mods only
app.post("/make-server-d620122a/moderation/posts/:postId/dismiss", async (c) => {
  try {
    const postId = c.req.param('postId');
    const { username } = await c.req.json();

    if (!await isMod(username)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Unhide the post and clear report flags
    const post = await kv.get(`post:${postId}`);
    if (post) {
      await kv.set(`post:${postId}`, { ...post, isReported: false, isHidden: false, reportCount: 0 });
    }

    // Mark all reports for this post as dismissed
    const allReports = await kv.getByPrefix('report:');
    for (const r of allReports) {
      if (r.postId === postId && r.status === 'pending') {
        await kv.set(`report:${r.id}`, { ...r, status: 'dismissed', reviewedBy: username, reviewedAt: Date.now(), action: 'dismissed' });
      }
    }

    return c.json({ success: true, message: 'Reports dismissed, post restored' });
  } catch (error) {
    console.error('Dismiss error:', error);
    return c.json({ error: 'Failed to dismiss reports' }, 500);
  }
});

// Keep old reportId-based routes for backward compat
app.post("/make-server-d620122a/moderation/reports/:reportId/remove", async (c) => {
  const { username } = await c.req.json().catch(() => ({}));
  const reportId = c.req.param('reportId');
  const report = await kv.get(`report:${reportId}`).catch(() => null);
  if (!report) return c.json({ error: 'Not found' }, 404);
  return c.redirect(`/make-server-d620122a/moderation/posts/${report.postId}/remove`, 307);
});

app.post("/make-server-d620122a/moderation/reports/:reportId/dismiss", async (c) => {
  const { username } = await c.req.json().catch(() => ({}));
  const reportId = c.req.param('reportId');
  const report = await kv.get(`report:${reportId}`).catch(() => null);
  if (!report) return c.json({ error: 'Not found' }, 404);
  return c.redirect(`/make-server-d620122a/moderation/posts/${report.postId}/dismiss`, 307);
});

// Mod direct delete any post
app.delete("/make-server-d620122a/moderation/posts/:id", async (c) => {
  try {
    const postId = c.req.param('id');
    const { username } = await c.req.json();

    if (!await isMod(username)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    await kv.del(`post:${postId}`);

    return c.json({ success: true, message: 'Post deleted by moderator' });
  } catch (error) {
    console.error('Mod delete error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }