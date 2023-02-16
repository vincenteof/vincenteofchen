type GitHubFile = { path: string; content: string };

type MDFileAttributes = {
  title: string;
  date: string;
  description: string;
  meta: {
    keyword: string[];
  };
  lang: "zh-CN";
};

export { GitHubFile, MDFileAttributes };
