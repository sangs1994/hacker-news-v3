const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export type Story = {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  descendants: number;
  time: number;
};

export const getTopStoryIds = async (): Promise<number[]> => {
  const res = await fetch(`${BASE_URL}/topstories.json`);
  return res.json();
};

export const getNewStoryIds = async (): Promise<number[]> => {
  const res = await fetch(`${BASE_URL}/newstories.json`);
  return res.json();
};

export const getStoryById = async (id: number): Promise<Story> => {
  const res = await fetch(`${BASE_URL}/item/${id}.json`);
  return res.json();
};
