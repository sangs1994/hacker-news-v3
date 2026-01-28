import { useState } from "react";
import { useStoryIds, useStoryDetails } from "../hooks/useStories";

const PAGE_SIZE = 10;

export default function Top() {
  const [page, setPage] = useState(1);

  const idsQuery = useStoryIds("top");

  const pageIds = idsQuery.data?.slice(0, page * PAGE_SIZE);

  const storiesQuery = useStoryDetails(pageIds);

  if (idsQuery.isLoading || storiesQuery.isLoading) return <p>Loading…</p>;

  if (idsQuery.isError || storiesQuery.isError)
    return <p>Error loading stories</p>;

  return (
    <div>
      <h2>Top Stories</h2>

      {storiesQuery.data?.map((story) => (
        <div key={story.id} style={{ marginBottom: 12 }}>
          <a href={story.url} target="_blank" rel="noreferrer">
            {story.title}
          </a>
          <div style={{ fontSize: 12 }}>
            ⭐ {story.score} | 💬 {story.descendants} | by {story.by}
          </div>
        </div>
      ))}

      <button onClick={() => setPage((p) => p + 1)}>Load more</button>
    </div>
  );
}
