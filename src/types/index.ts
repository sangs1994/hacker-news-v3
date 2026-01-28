export type FeedKind = "top" | "new" | "best";
export type TimeRange = "1d" | "1m" | "1y";

export type HNStory = {
  id: number;
  title: string;
  by: string;
  time: number;
  score?: number;
  descendants?: number;
  url?: string;
  kids?: number[];
};

export type HNComment = {
  id: number;
  by?: string;
  time?: number;
  text?: string;
  kids?: number[];
};
