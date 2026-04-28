// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

// ============================================
// REPLIES ROUTES
// ============================================

// Get replies for a post
app.get("/make-server-d620122a/posts/:postId/replies", async (c) => {
  try {
    const postId = c.req.param('postId');
    const allReplies = await kv.getByPrefix(`reply:${postId}:`);

    return c.json({ replies: allReplies });
  } catch (error) {
    console.error('Fetch replies error:', error);
    return c.json({ error: 'Failed to fetch replies' }, 500);
  }
});

// Create reply
app.post("/make-server-d620122a/posts/:postId/replies", async (c) => {
  try {
    const postId = c.req.param('postId');
    const { content, username, anonId, parentReplyId } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content required' }, 400);
    }

    const replyId = generateId();
    const reply = {
      id: replyId,
      postId,
      parentReplyId: parentReplyId || null,
      content,
      username: username || null,
      anonId: anonId || generateAnonName(),
      createdAt: Date.now(),
      level: 0
    };

    // Calculate nesting level
    if (parentReplyId) {
      const parentReply = await kv.get(`reply:${postId}:${parentReplyId}`);
      if (parentReply) {
        reply.level = Math.min((parentReply.level || 0) + 1, 5);
      }
    }

    await kv.set(`reply:${postId}:${replyId}`, reply);

    // Update post reply count
    const post = await kv.get(`post:${postId}`);
    if (post) {
      post.replyCount = (post.replyCount || 0) + 1;
      await kv.set(`post:${postId}`, post);
    }

    // Update user reply count
    if (username) {
      const user = await kv.get(`user:${username}`);
      if (user) {
        user.replyCount = (user.replyCount || 0) + 1;
        await kv.set(`user:${username}`, user);
      }
    }

    return c.json({ success: true, reply });
  } catch (error) {
    console.error('Create reply error:', error);
    return c.json({ error: 'Failed to create reply' }, 500);
  }
});

// Delete reply
app.delete("/make-server-d620122a/posts/:postId/replies/:replyId", async (c) => {
  try {
    const { postId, replyId } = c.req.param();
    const { username } = await c.req.json();

    const reply = await kv.get(`reply:${postId}:${replyId}`);
    if (!reply) {
      return c.json({ error: 'Reply not found' }, 404);
    }

    // Check authorization
    const user = await kv.get(`user:${username}`);
    if (reply.username !== username && !user?.isAdmin && !user?.isModerator) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.del(`reply:${postId}:${replyId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete reply error:', error);
    return c.json({ error: 'Failed to delete reply' }, 500);
  }
});

// ============================================
// BOARDS ROUTES
// ============================================

// Get all boards