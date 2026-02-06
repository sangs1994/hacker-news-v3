import { hnGet } from "./client";
import { hnEndpoints } from "./endpoints";
import type { FeedKind, HNStory, HNComment } from "../types/index";

export async function getStoryIds(kind: FeedKind): Promise<number[]> {
  switch (kind) {
    case "top":
      return hnGet(hnEndpoints.topStories);

    case "new":
      return hnGet(hnEndpoints.newStories);

    case "best":
      return hnGet(hnEndpoints.bestStories);

    default:
      return [];
  }
}

export async function getItem<T>(id: number): Promise<T | null> {
  return hnGet(hnEndpoints.item(id));
}

// IDs -> full story objects
export async function getStories(
  kind: FeedKind,
  limit: number,
): Promise<HNStory[]> {
  const ids = await getStoryIds(kind);
  const slice = ids.slice(0, limit);

  const items = await Promise.all(slice.map((id) => getItem<HNStory>(id)));

  return items.filter((x): x is HNStory => !!x && typeof x.title === "string");
}

export async function getTopLevelComments(
  storyId: number,
  limit = 20,
): Promise<HNComment[]> {
  const story = await getItem<HNStory>(storyId);
  const kids = story?.kids ?? [];
  const slice = kids.slice(0, limit);

  const comments = await Promise.all(slice.map((id) => getItem<HNComment>(id)));
  return comments.filter((x): x is HNComment => !!x && !("title" in x));
}

export async function getBestPicks(): Promise<HNStory[]> {
  return getStories("best", 5);
}
