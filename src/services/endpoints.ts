export const hnEndpoints = {
  topStories: "/topstories.json",
  newStories: "/newstories.json",
  bestStories: "/beststories.json",
  showStories: "/showstories.json",
  askStories: "/askstories.json",
  jobStories: "/jobstories.json",
  item: (id: number) => `/item/${id}.json`,
};
