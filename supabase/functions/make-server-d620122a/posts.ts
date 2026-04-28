// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

// ============================================
// POSTS ROUTES
// ============================================

// Get all posts (with filtering)
app.get("/make-server-d620122a/posts", async (c) => {
  try {
    const board = c.req.query('board');
    const sort = c.req.query('sort') || 'new';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '15');

    const allPosts = await kv.getByPrefix('post:');
    // Filter out auto-hidden posts (50+ reports, awaiting mod review)
    let posts = allPosts.filter(p => !p.isHidden);

    // Filter by board
    if (board && board !== 'all') {
      posts = posts.filter(p => p.board === board);
    }

    // Sort posts
    if (sort === 'new') {
      posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === 'hot') {
      posts.sort((a, b) => (b.likes + b.replyCount * 2) - (a.likes + a.replyCount * 2));
    } else if (sort === 'top') {
      posts.sort((a, b) => b.likes - a.likes);
    }

    // Paginate
    const start = (page - 1) * limit;
    const paginatedPosts = posts.slice(start, start + limit);

    return c.json({ posts: paginatedPosts, total: posts.length, page, limit });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Get single post
app.get("/make-server-d620122a/posts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const post = await kv.get(`post:${id}`);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await kv.set(`post:${id}`, post);

    return c.json({ post });
  } catch (error) {
    console.error('Fetch post error:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// Create new post
app.post("/make-server-d620122a/posts", async (c) => {
  try {
    const { title, content, board, username, anonId } = await c.req.json();

    if (!title || !content || !board) {
      return c.json({ error: 'Title, content, and board required' }, 400);
    }

    const postId = generateId();
    const post = {
      id: postId,
      title,
      content,
      board,
      username: username || null,
      anonId: anonId || generateAnonName(),
      createdAt: Date.now(),
      likes: 0,
      replyCount: 0,
      views: 0,
      isPinned: false
    };

    await kv.set(`post:${postId}`, post);

    // Update user post count
    if (username) {
      const user = await kv.get(`user:${username}`);
      if (user) {
        user.postCount = (user.postCount || 0) + 1;
        await kv.set(`user:${username}`, user);
      }
    }

    return c.json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Like post
app.post("/make-server-d620122a/posts/:id/like", async (c) => {
  try {
    const id = c.req.param('id');
    const { voterId } = await c.req.json().catch(() => ({ voterId: null }));
    const post = await kv.get(`post:${id}`);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (voterId) {
      const likedBy: string[] = post.likedBy || [];
      const alreadyLiked = likedBy.includes(voterId);

      if (alreadyLiked) {
        // Unlike
        post.likedBy = likedBy.filter((v: string) => v !== voterId);
        post.likes = Math.max(0, (post.likes || 0) - 1);
        await kv.set(`post:${id}`, post);
        return c.json({ success: true, likes: post.likes, liked: false });
      } else {
        // Like
        post.likedBy = [...likedBy, voterId];
        post.likes = (post.likes || 0) + 1;
        await kv.set(`post:${id}`, post);
        return c.json({ success: true, likes: post.likes, liked: true });
      }
    } else {
      // Fallback: no voterId, just increment (anonymous)
      post.likes = (post.likes || 0) + 1;
      await kv.set(`post:${id}`, post);
      return c.json({ success: true, likes: post.likes, liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return c.json({ error: 'Failed to like post' }, 500);
  }
});

// Delete post
app.delete("/make-server-d620122a/posts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const { username, anonId } = await c.req.json();

    const post = await kv.get(`post:${id}`);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Check authorization: logged-in creator, anon creator, or mod/admin
    const user = username ? await kv.get(`user:${username}`).catch(() => null) : null;
    const isOwner = (username && post.username === username) || (anonId && post.anonId === anonId);
    const isModerator = user?.isAdmin || user?.isModerator || username === 'Abhignyan1103';

    if (!isOwner && !isModerator) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.del(`post:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});
