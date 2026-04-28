// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

// ============================================
// REPORT ROUTES
// ============================================

const AUTO_HIDE_THRESHOLD = 50;

// Report a post
app.post("/make-server-d620122a/posts/:id/report", async (c) => {
  try {
    const postId = c.req.param('id');
    const { reason, username, anonId } = await c.req.json();

    if (!reason) {
      return c.json({ error: 'Reason required' }, 400);
    }

    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Prevent duplicate reports from same user/anon
    const reporterId = username || anonId || 'anonymous';
    const alreadyReportedKey = `reported:${postId}:${reporterId}`;
    const alreadyReported = await kv.get(alreadyReportedKey).catch(() => null);
    if (alreadyReported) {
      return c.json({ error: 'You have already reported this post' }, 409);
    }
    await kv.set(alreadyReportedKey, { reportedAt: Date.now() });

    const reportId = generateId();
    const newReportCount = (post.reportCount || 0) + 1;
    const autoHidden = newReportCount >= AUTO_HIDE_THRESHOLD;

    const report = {
      id: reportId,
      postId,
      postTitle: post.title,
      postContent: post.content,
      postAnonId: post.anonId,
      reason,
      reportedBy: reporterId,
      createdAt: Date.now(),
      status: 'pending',
      totalReportsOnPost: newReportCount,
    };

    await kv.set(`report:${reportId}`, report);

    // Update post — auto-hide if threshold reached
    await kv.set(`post:${postId}`, {
      ...post,
      reportCount: newReportCount,
      isReported: true,
      isHidden: autoHidden,
    });

    return c.json({
      success: true,
      message: autoHidden
        ? 'Post reported and automatically hidden pending review'
        : 'Post reported successfully',
      autoHidden,
    });
  } catch (error) {
    console.error('Report error:', error);
    return c.json({ error: 'Failed to report post' }, 500);
  }
});
