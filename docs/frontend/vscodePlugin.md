---
title: 一文上手 vscode 插件开发
author: xiyue
date: '2024-11-18'
---
## 安装

```shell
// 安装需要的包 
npm install -g yo generator-code
// 运行 
yo code
```
一个项目就生成好了。
## package.json 关键字段

```json
{
    "name": "demo", // 插件名 
    "displayName": "插件", // 显示在应用市场的名字
    // 插件的主入口文件 
    "main": "./extension.js",
    // 贡献点 
    "contributes": { 
        // 命令 
        "commands": [ 
            { 
                "command": "demo.helloWorld", 
                "title": "Hello World" 
            } 
          ] 
        },
}
```

### 插件激活时机 activationEvents
-   `*` 只要一启动vscode，插件就会被激活
-   `onCommand` 在调用命令时被激活
-   `workspaceContains`每当打开文件夹并且该文件夹包含至少一个与 glob 模式匹配的文件时

-   `onFileSystem`每当读取来自特定*方案*的文件或文件夹时

-   `onView`每当在 VS Code 侧栏中展开指定 id 的视图

-   `onUri` 每当打开该扩展的系统范围的 Uri 时

### 扩展配置 contributes

-   `breakpoints`断点
-   `colors` 主题颜色
-   `commands` 命令
-   `configuration`配置
-   `keybindings`快捷键绑定
-   `snippets`特定语言的片段
-   `menus` 菜单

对每个扩展可以通过when语句控制显示条件

## 入口文件 extension.ts

1.  `activate` 插件被激活时执行的函数，一般在里面注册命令



2.  `deactivate` 插件被销毁时调用的方法

## 开发问题

### vsce package包错npm error

默认是 npm执行导致包错，写成命令的方式执行：
```json
"package": "vsce package --no-dependencies"
```

### webview 不能执行 js 脚本/切换标签页不保存上下文

1. enableScripts 代表允许js脚本执行
2. retainContextWhenHidden 代表当页签切换离开时保持插件上下文不销毁

```js
panel = vscode.window.createWebviewPanel(
  "movie",
  "Cola Movie",
  vscode.ViewColumn.One,
  {
    enableScripts: true,
    retainContextWhenHidden: true,
  }
);
```

## 发布

通过官网选择vscode code上传visx文件