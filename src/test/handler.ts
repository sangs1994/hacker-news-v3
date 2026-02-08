import { rest } from "msw";

// Hacker News Firebase API base
const BASE = "https://hacker-news.firebaseio.com/v0";

export const handlers = [
  // Feed ids: /v0/newstories.json, /v0/topstories.json etc.
  rest.get(`${BASE}/:feed.json`, (req, res, ctx) => {
    const feed = req.params.feed as string;

    // Return 60 fake IDs (you can customize per feed if you want)
    const ids = Array.from({ length: 60 }, (_, i) => i + 1);

    return res(ctx.status(200), ctx.json(ids));
  }),

  // Item: /v0/item/123.json
  rest.get(`${BASE}/item/:id.json`, (req, res, ctx) => {
    const id = Number(req.params.id);

    return res(
      ctx.status(200),
      ctx.json({
        id,
        title: `Story ${id}`,
        by: "tester",
        time: 1700000000,
        score: 100,
        url: "https://example.com",
        type: "story",
        descendants: 10,
        kids: [101, 102],
      }),
    );
  }),
];
