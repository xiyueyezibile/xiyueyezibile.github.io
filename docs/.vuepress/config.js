module.exports = {
  title: "xiyue 的博客",
  description: "种一棵树最好的时间是十年前，其次是现在。",
  base: "/blog/",
  theme: "reco",
  locales: {
    "/": {
      lang: "zh-CN",
    },
  },
  themeConfig: {
    subSidebar: "auto",
    nav: [
      { text: "首页", link: "/" },
      {
        text: "xiyue 的博客",
        items: [
          { text: "掘金", link: "https://juejin.cn/user/2159893581924631" },
          { text: "Github", link: "https://github.com/xiyueyezibile" },
        ],
      },
    ],
    sidebar: [
      {
        title: "简介",
        path: "/",
        collapsable: false,
        children: [
          {
            title: "关于我",
            path: "/",
          },
        ],
      },
      {
        title: "前端技术分享",
        path: "/frontend",
        collapsable: false,
        children: [
          {
            title: "pnpm + monorepo 为何是组件库/工具库的最佳方案",
            path: "/frontend/pnpmMonorepo",
          },
        ],
      },
    ],
  },
};
