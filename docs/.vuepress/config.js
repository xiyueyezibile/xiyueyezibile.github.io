module.exports = {
  title: "xiyue 的博客",
  description: "种一棵树最好的时间是十年前，其次是现在。",
  base: "/",
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
          {
            title: "尝试一图理清prototype、proto、原型对象之间的关系",
            path: "/frontend/prototype",
          },
          {
            title: "zustand 源码解析",
            path: "/frontend/zustand",
          },
          {
            title: "详细教程搭建 react 项目",
            path: "/frontend/createReact",
          },
          {
            title: "一文搞懂webpack配置",
            path: "/frontend/webpackAwesome",
          },
          {
            title: "前端模块化",
            path: "/frontend/frontendModule",
          },
        ],
      },
      {
        title: "计算机网络",
        path: "/network",
        collapsable: false,
        children: [
          {
            title: "快速了解计算机网络 - HTTP篇",
            path: "/network/http",
          },
        ],
      },
    ],
  },
};
