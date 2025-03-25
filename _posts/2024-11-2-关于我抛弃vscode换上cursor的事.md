---
layout:     post
title:      关于我抛弃vscode换上cursor的事
subtitle:   cursor
date:       2024-11-2
author:     XIY
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - ai
    - frontend
    - 杂谈
---

## 前言

VSCode 作为一个老牌的前端开发者的工具，受到了广大使用者的好评！自从入行以来，就一直在使用 VSCode，可以说是忠实用户了。

平常也有用代码提示和补全功能，但一直觉得不够智能，尤其是对于一些复杂的代码，提示不够准确，有时候还需要自己手动去补全。

但偶然间，了解到了 cursor 编译器，他是一个基于 vscode 开发的编辑器，加强了代码补全、代码提示等功能。

比之前用的更加强大，于是便投入了 cursor 的怀抱了！

## 如何用好 cursor？

### 准确描述提示词

#### AI 对话过程中提示词类别
System Prompt
- 定义 Assistant 的角色、行为、基础规则
- 例如：专注在前端问题的解答
User Prompt
- 用户输入问题/指令
- 例如：生成一个 Table 组件
Assistant Prompt
- AI 回复内容
- 例如：Table 组件的代码
Tools Prompt
- 调用特定功能生成的内容
- 例如：调用代码生成器，生成 Table 组件的代码

市面上大家讨论的提示词工程，主要集中在如何编写 System Prompt，它决定了 AI 会用什么样的内容（Assistant Prompt）来回复用户的需求（User Prompt）。
因此后文我们本质上主要讨论 System Prompt 工程。

#### 编写提示词的核心原则
对 AI 来说，就是拆分成多个提示词，每个提示词解决一个小问题。
串联起来，就形成了完整的解决方案，也就是提示词链。
##### BROKE 原则
BROKE：B（Background）、R（Role：角色）、O（Objective：目标）、K（Key Result：关键结果）、E（Evolve：反馈迭代）
B：你是一个前端问题解答助手
R：你善于解答前端开发中遇到的问题，比如：组件的封装、代码的生成、库的安装、工具的使用等
O：你的目标是帮助用户解决前端开发中遇到的问题
K：每次回答问题，按照以下格式：
- 问题：用户的问题
- 回答：问题的答案
- 原因：产生回答的原因
- 代码：辅助理解（如果需要）
E：在 AI 给出输出的结果后，用户提供的一些反馈和优化建议
##### ICIO 原则
ICIO：I（Intruction：介绍）、C（Context：背景上下文）、I（Input：输入）、O（Output：输出）
I：你是一个前端业务组件生成助手
C：你善于根据用户的需求，生成对应的业务组件
I：用户会问你一些问题，比如：生成一个 Table 组件或者给一个设计稿图，让你生成对应的代码
O：生成的业务组件代码遵循的规范：
- 代码规范：遵循 Ant Design 的组件规范
- 技术栈：React、Typescript、Less
- 代码风格：函数式编程
##### 结构化提示词
```markdown
# Role: 前端业务组件生成助手


## Profile

- Author: xx
- Version: 1.0
- Language: 中文
- Description: 你是一个前端业务组件生成助手，善于根据用户的需求，生成对应的业务组件

## Rules

1. 不要打破角色设定，只能回答和组件生成相关的问题
2. 不要胡言乱语，不要编造 API
3. 使用 antd 组件库

## Workflow

1. 首先，理解用户的需求描述
2. 然后，根据用户的需求描述，分析需要用到的 antd 组件
3. 最后，根据分析的组件，生成对应的代码

## Initialization

做为<Role>，你必须遵循<Rules>，你必须用<Language>和用户交流，你必须问候用户，然后介绍自己，最后介绍<Workflow>。
```

##### COT
COT（Chain of Thought）思维链的核心就是让大模型逐步思考、逐步回答，提升大模型的推理能力和回答的准确性。

简单的就是在提示词中加上一句经典的Let's think step by step，就可以开启思维链模式。

### 查询内网资料

可以接入 MCP