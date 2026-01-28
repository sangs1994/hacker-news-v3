export const hnEndpoints = {
  topStories: "/topstories.json",
  newStories: "/newstories.json",
  bestStories: "/bestpicks.json",
  item: (id: number) => `/item/${id}.json`,
};
