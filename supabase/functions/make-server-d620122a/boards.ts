// Import shared app instance + helpers
import { app, kv, generateId, generateAnonName, hashPassword } from "./app.ts";

// ============================================
// BOARDS ROUTES
// ============================================

// Get all boards
app.get("/make-server-d620122a/boards", async (c) => {
  try {
    const boards = await kv.getByPrefix('board:');
    return c.json({ boards });
  } catch (error) {
    console.error('Fetch boards error:', error);
    return c.json({ error: 'Failed to fetch boards' }, 500);
  }
});

// Initialize default boards (call once)
app.post("/make-server-d620122a/boards/init", async (c) => {
  try {
    const defaultBoards = [
      { id: 'general', name: 'General', icon: '💬', description: 'Open discussion on any topic' },
      { id: 'literature', name: 'Literature', icon: '📚', description: 'Books, poetry, and writing' },
      { id: 'communication', name: 'Communication', icon: '🗣️', description: 'Relationships and social skills' },
      { id: 'midlife', name: 'Midlife Crisis', icon: '🔄', description: 'Navigating life transitions' },
      { id: 'advice', name: 'Life Advice', icon: '🌟', description: 'Wisdom and guidance' },
      { id: 'tech', name: 'Technology', icon: '💻', description: 'Tech talk and innovation' },
      { id: 'career', name: 'Career', icon: '💼', description: 'Work and professional growth' },
      { id: 'philosophy', name: 'Philosophy', icon: '🤔', description: 'Deep thoughts and ideas' },
      { id: 'creative', name: 'Creative', icon: '🎨', description: 'Art, music, and creativity' },
      { id: 'wellness', name: 'Wellness', icon: '🧘', description: 'Mental and physical health' },
      { id: 'confessions', name: 'Confessions', icon: '🤐', description: 'Share your secrets safely' },
      { id: 'science', name: 'Science', icon: '🔬', description: 'Scientific discussion and discovery' }
    ];

    for (const board of defaultBoards) {
      await kv.set(`board:${board.id}`, board);
    }

    return c.json({ success: true, boards: defaultBoards });
  } catch (error) {
    console.error('Init boards error:', error);
    return c.json({ error: 'Failed to initialize boards' }, 500);
  }
});

// Seed sample posts (call once to populate)
app.post("/make-server-d620122a/seed", async (c) => {
  try {
    const samplePosts = [
      {
        id: generateId(),
        title: "Just finished 'One Hundred Years of Solitude' and I'm speechless",
        content: "Gabriel García Márquez has completely blown my mind. The way he weaves magical realism into such a deeply human story... I've never read anything like it. The Buendía family will stay with me forever. Anyone else read this? What did you think?",
        board: 'literature',
        anonId: 'ANON_WiseOwl_2847',
        createdAt: Date.now() - 7200000,
        likes: 156,
        replyCount: 34,
        views: 892,
        isPinned: false
      },
      {
        id: generateId(),
        title: "How do I tell my partner I need more emotional support?",
        content: "We've been together 5 years. They're amazing in so many ways, but when I'm struggling, they just try to 'fix' things instead of listening. I don't need solutions, I need empathy. How do I communicate this without sounding ungrateful?",
        board: 'communication',
        anonId: 'ANON_GentleFox_1923',
        createdAt: Date.now() - 10800000,
        likes: 289,
        replyCount: 67,
        views: 1247,
        isPinned: false
      },
      {
        id: generateId(),
        title: "I'm 42 and questioning everything I've built",
        content: "Good job, nice house, stable marriage, two kids. On paper, I have it all. But I wake up every day feeling empty. Is this it? Did I miss something? I feel guilty for even thinking this way when so many people would kill for my life. But I can't shake this feeling that I'm living someone else's dream.",
        board: 'midlife',
        anonId: 'ANON_SilentWolf_4156',
        createdAt: Date.now() - 14400000,
        likes: 523,
        replyCount: 142,
        views: 2341,
        isPinned: true
      },
      {
        id: generateId(),
        title: "The best advice my grandmother gave me",
        content: "'Never make permanent decisions based on temporary emotions.' She told me this when I was 19 and wanted to drop out of college. Twenty years later, this single sentence has saved me from so many mistakes. What's the best advice you've ever received?",
        board: 'advice',
        anonId: 'ANON_WiseEagle_7382',
        createdAt: Date.now() - 18000000,
        likes: 734,
        replyCount: 203,
        views: 3892,
        isPinned: true
      },
      {
        id: generateId(),
        title: "Why does everyone hate CSS? I genuinely love it",
        content: "I see developers constantly complaining about CSS, calling it broken or unintuitive. But honestly? I find it beautiful. The cascade makes sense to me. Flexbox and Grid are elegant solutions. Maybe I'm weird, but I actually enjoy styling interfaces. Am I alone in this?",
        board: 'tech',
        anonId: 'ANON_QuickHawk_2891',
        createdAt: Date.now() - 21600000,
        likes: 412,
        replyCount: 98,
        views: 1876,
        isPinned: false
      },
      {
        id: generateId(),
        title: "Should I quit my stable job to pursue my passion?",
        content: "I'm a software engineer making $120k. Comfortable, but soul-crushing. I've always wanted to be a woodworker. I could probably make half the salary, but I'd actually be happy. I'm 35, single, no kids. If not now, when? But everyone says I'm crazy. What would you do?",
        board: 'career',
        anonId: 'ANON_BoldLion_5621',
        createdAt: Date.now() - 25200000,
        likes: 891,
        replyCount: 267,
        views: 4532,
        isPinned: true
      },
      {
        id: generateId(),
        title: "If a tree falls in a forest and no one hears it, does it make a sound?",
        content: "I know this is the classic question, but I've been thinking about it differently lately. It's not really about sound—it's about whether reality exists independent of observation. Quantum mechanics suggests maybe it doesn't. Are we creating reality by observing it? Or is this just human ego?",
        board: 'philosophy',
        anonId: 'ANON_MysticRaven_8234',
        createdAt: Date.now() - 28800000,
        likes: 234,
        replyCount: 89,
        views: 1432,
        isPinned: false
      },
      {
        id: generateId(),
        title: "I started painting at 50 and sold my first piece today",
        content: "Never picked up a brush until two years ago. Today, someone paid $400 for my painting. I'm crying. It's not about the money—it's about being seen. About creating something that resonated with another human being. If you're on the fence about trying something new: DO IT. It's never too late.",
        board: 'creative',
        anonId: 'ANON_BraveTiger_9123',
        createdAt: Date.now() - 32400000,
        likes: 1247,
        replyCount: 178,
        views: 5632,
        isPinned: true
      },
      {
        id: generateId(),
        title: "Meditation changed my anxiety, but not how I expected",
        content: "I didn't become calm or zen. Instead, I became aware of how much mental noise I was carrying. The anxiety didn't disappear—I just stopped being afraid of it. I can now observe my thoughts instead of being consumed by them. 10 minutes a day for 3 months. That's all it took.",
        board: 'wellness',
        anonId: 'ANON_GentleBear_4567',
        createdAt: Date.now() - 36000000,
        likes: 667,
        replyCount: 134,
        views: 2891,
        isPinned: false
      },
      {
        id: generateId(),
        title: "I faked my college degree and got away with it for 15 years",
        content: "I never graduated. I was 3 credits short, got a job offer, and just... put the degree on my resume. No one ever checked. I've been successful, promoted multiple times, manage a team. I'm good at what I do. But the guilt eats me alive. I can't tell anyone. Ever. This secret will die with me.",
        board: 'confessions',
        anonId: 'ANON_SilentFalcon_3421',
        createdAt: Date.now() - 39600000,
        likes: 892,
        replyCount: 312,
        views: 6234,
        isPinned: true
      },
      {
        id: generateId(),
        title: "The James Webb telescope images prove we're not alone",
        content: "Those galaxies are 13 billion years old. BILLIONS. With trillions of stars each. And we think we're the only intelligent life? The math doesn't add up. Either the universe is teeming with life and we haven't found it yet, or something prevents civilizations from spreading. Either answer is terrifying.",
        board: 'science',
        anonId: 'ANON_CleverOwl_7891',
        createdAt: Date.now() - 43200000,
        likes: 543,
        replyCount: 167,
        views: 3421,
        isPinned: false
      },
      {
        id: generateId(),
        title: "Why is everyone so obsessed with productivity?",
        content: "Every podcast, every book, every influencer is talking about optimization, routines, hacks. But what if the point of life isn't to be productive? What if rest, play, and aimless wandering are just as valuable? I'm so tired of feeling guilty for not 'maximizing' every moment.",
        board: 'general',
        anonId: 'ANON_WiseFox_2348',
        createdAt: Date.now() - 46800000,
        likes: 723,
        replyCount: 198,
        views: 4123,
        isPinned: false
      },
      {
        id: generateId(),
        title: "What book completely changed your perspective on life?",
        content: "For me, it was 'Man's Search for Meaning' by Viktor Frankl. Reading about how he found purpose in a concentration camp made my problems feel trivial. But more than that—it taught me that meaning isn't something you find, it's something you create. What book rewired your brain?",
        board: 'literature',
        anonId: 'ANON_NobleEagle_5632',
        createdAt: Date.now() - 50400000,
        likes: 445,
        replyCount: 156,
        views: 2567,
        isPinned: false
      },
      {
        id: generateId(),
        title: "My partner and I communicate perfectly—we just don't talk",
        content: "We've been together 12 years. We can spend an entire evening in comfortable silence, each doing our own thing, and feel completely connected. A look says more than a conversation. Is this weird? Everyone talks about 'communication' but sometimes I think we over-talk things.",
        board: 'communication',
        anonId: 'ANON_SwiftRaven_8934',
        createdAt: Date.now() - 54000000,
        likes: 334,
        replyCount: 87,
        views: 1823,
        isPinned: false
      },
      {
        id: generateId(),
        title: "I turned 40 and nothing bad happened",
        content: "All the jokes about aging, midlife crisis, your body falling apart... none of it happened. I actually feel more confident and comfortable in my skin than I did at 25. Why does society make getting older sound like a catastrophe? It's actually pretty great.",
        board: 'midlife',
        anonId: 'ANON_BoldHawk_4521',
        createdAt: Date.now() - 57600000,
        likes: 567,
        replyCount: 121,
        views: 2234,
        isPinned: false
      },
      {
        id: generateId(),
        title: "Stop asking for advice you won't take",
        content: "Real talk: Most people who ask for advice have already decided what they're going to do. They're just looking for validation. If you're not ready to hear 'don't do it,' don't ask. And if you ask, actually listen. Otherwise you're wasting everyone's time, including your own.",
        board: 'advice',
        anonId: 'ANON_CleverWolf_6234',
        createdAt: Date.now() - 61200000,
        likes: 891,
        replyCount: 243,
        views: 4521,
        isPinned: false
      }
    ];

    for (const post of samplePosts) {
      await kv.set(`post:${post.id}`, post);
    }

    return c.json({ success: true, message: `Seeded ${samplePosts.length} posts` });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ error: 'Failed to seed data' }, 500);
  }
});

