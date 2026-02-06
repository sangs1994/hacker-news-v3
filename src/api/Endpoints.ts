export const hnEndpoints = {
  topStories: "/topstories.json",
  newStories: "/newstories.json",
  bestStories: "/beststories.json",
  item: (id: number) => `/item/${id}.json`,
};
