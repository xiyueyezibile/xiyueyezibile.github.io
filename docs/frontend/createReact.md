---
title: pnpm + monorepo 为何是组件库/工具库的最佳方案
author: xiyue
date: '2023-09-24'
---

## create-react-app 搭建react项目

使用`pnpm install -g create-react-app`命令全局安装react脚手架。

`npx create-react-app my-app --template typescript`创建基于TypeScript的react项目。

注：typescript版好像默认会下载tailwindcss，如果用的习惯就没必要配置less了

```ts
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./", // 路径配置
    "paths": {
      "@": ["src"],
      "@/*": ["src/*"]
    },
    "target": "ES2020", // 指定 ECMAScript 版本
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 要包含在编译中的依赖库文件列表
    "allowJs": true, // 允许编译 JavaScript 文件
    "skipLibCheck": true, // 跳过所有声明文件的类型检查
    "esModuleInterop": true, // 禁用命名空间引用 (import * as fs from "fs") 启用 CJS/AMD/UMD 风格引用 (import fs from "fs")
    "allowSyntheticDefaultImports": true, // 允许从没有默认导出的模块进行默认导入
    "strict": true, // 启用所有严格类型检查选项
    "forceConsistentCasingInFileNames": true, //	禁止对同一个文件的不一致的引用。
    "noFallthroughCasesInSwitch": true, // 报告switch语句的fallthrough错误。（即，不允许switch的case语句贯穿）
    "module": "esnext", // 指定模块代码生成
    "moduleResolution": "node", // 使用 Node.js 风格解析模块
    "resolveJsonModule": true, // 允许使用 .json 扩展名导入的模块
    "isolatedModules": true, // 将每个文件作为单独的模块
    "noEmit": false, // 不输出(意思是不编译代码，只执行类型检查)
    "jsx": "react-jsx",
    "noUnusedLocals": true, // 报告未使用的本地变量的错误
    "noUnusedParameters": false, // 报告未使用参数的错误
    "experimentalDecorators": true, // 启用对ES装饰器的实验性支持
  },
  "include": [
    "src" // TypeScript文件应该进行类型检查
  ],
  "exclude": ["node_modules", "build"] // 不进行类型检查的文件
}
```

### prettier

pnpm i -D prettier 安装prettier，代码格式化检查

```ts
// .prettierignore
node_modules
dist
.prettierignore
```



```ts
// .prettierrc.js
module.exports = {
  printWidth: 120, // 指定编译器换行的行长
  tabWidth: 2, // 指定每个缩进空格数
  semi: true, // 在语句的末尾输入分号
  singleQuote: true, // 使用单引号而不是双引号
  trailingComma: 'none', // 在多行逗号分隔的句法结构中尽可能输入尾随逗号
  bracketSpacing: true, // 在对象字面量中的括号之间输入空格
  jsxBracketSameLine: true, // 将多行 JSX 元素的 > 放在最后一行的末尾，而不是单独放在下一行
  arrowParens: 'always', // 在唯一的箭头函数参数周围包含括号
  useTabs: false, // 使用制表符而不是空格缩进行
  ignorePath: '.prettierignore',
};
```

pnpm install react-router-dom@6 使用react-router v6配置路由

### ESLint

`ESLint` 是在 ECMAScript/JavaScript 代码中识别和报告模式匹配的工具，它的目标是保证代码的一致性和避免错误——就是一个代码检查工具。

介绍下常用的插件及其用处：

- **@typescript-eslint/parser**：代替eslint默认的解析器 Espree 对 TypeScript 的进行解析
- **eslint-plugin-react**：检测和规范React代码的书写的插件
- **@typescript-eslint/eslint-plugin**：包含了各类定义好的检测Typescript代码的规范
- **eslint-plugin-import**：ES2015 +（ES6 +）导入/导出语法的检查
- **eslint-import-resolver-webpack**：使 eslint 识别 webpack 配置，或者使用**eslint-import-resolver-alias**
- **babel-eslint**：使 eslint 支持有效的 babel 代码
- **eslint-plugin-prettier**：基于 `prettier` 代码风格的 `eslint` 规则
- **eslint-config-prettier**： 禁用所有与格式相关的 eslint 规则，解决 prettier 与 eslint 规则冲突，确保将其放在 `extends` 队列最后，这样它将覆盖其他配置。

老规矩使用`pnpm i -D eslint eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import babel-eslint eslint-plugin-prettier eslint-config-prettier`命令安装eslint和需要的插件。

然后声明一个`.eslintrc.js`文件用于配置我们的eslint规则：

```ts
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser', // 定义ESLint的解析器
  extends: ['plugin:prettier/recommended'], //定义文件继承的子规范
  plugins: ['@typescript-eslint', 'eslint-plugin-react'], //定义了该eslint文件所依赖的插件
  env: {
    //指定代码的运行环境
    browser: true,
    node: true
  },
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  parserOptions: {
    //指定ESLint可以解析JSX语法
    parser: 'babel-eslint',
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }], // 允许使用短路、三目
    'func-names': ['error', 'as-needed'], // 需要时添加函数名称
    'no-param-reassign': ['error', { props: false }], // 函数形参可修改
    'react/jsx-uses-react': 'off', // React 17及以后引入了新的 JSX 编译方式，无须在组件中显式地 import React，可关闭
    'react/react-in-jsx-scope': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
  }
};
```

`pnpm run eject`暴露webpack配置文件

```bash
pnpm install less-loader less --save`或`yarn add less-loader less --save
```

### 安装less和less-loader

搜索`sassRegex`，可以搜出来两个

模仿sass代码添加这两段代码分别到sass两端旁边

```ts
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
```



```tsx
// Opt-in support for less (using .scss or .sass extensions).
// By default we support less Modules with the
// extensions .module.less
{
  test: lessRegex,
  exclude: lessModuleRegex,
  use: getStyleLoaders(
    {
      importLoaders: 3,
      sourceMap: isEnvProduction && shouldUseSourceMap,
    },
    'less-loader'
  ),
  // Don't consider CSS imports dead code even if the
  // containing package claims to have no side effects.
  // Remove this when webpack adds a warning or an error for this.
  // See https://github.com/webpack/webpack/issues/6571
  sideEffects: true,
},
// Adds support for CSS Modules, but using less
// using the extension .module.less
{
  test: lessModuleRegex,
  use: getStyleLoaders(
    {
      importLoaders: 3,
      sourceMap: isEnvProduction && shouldUseSourceMap,
      modules: {
        getLocalIdent: getCSSModuleLocalIdent,
      },
    },
    'less-loader'
  ),
},
```

## vite搭建react项目

```bash
pnpm create vite@latest my-vite-app
```

vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

```

在 Vite 中引入 ESLint 插件，以便在开发阶段发现问题。.

```bash
pnpm i vite-plugin-eslint -D
```

vite.config.ts

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteEslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteEslint({
      failOnError: false
    })
  ]
})
```
### 配置别名ts报错问题
添加这两行代码
```json
// tsconfig.json
{
    "baseUrl": "./",
    "paths": {
	  // 根据别名配置相关路径
      "@/*": ["./src/*"]
    }
}
```
### vite.config.ts 配置别名导入 path 模块报错问题

```shell
pnpm i @types/node -D
```

### 配置less/sass

内置支持，只需要安装即可

```bash
pnpm i -D less
pnpm i -D sass
```

### 配置husky

`usky` 是一个 Git Hook 工具，借助它我们可以在 `git` 提交的不同生命周期进行一些自动化操作，常见的 hook 有 `pre-commit`、`commit-msg` 等。

```shell
pnpm install husky -D
```

配置 `package.json` 文件：

```js
"scripts": {
  // ...
  "prepare": "husky install"
},
```

然后，执行下面命令继续将 `husky` 安装完毕。

```shell
pnpm run prepare
```

#### 添加 pre-commit hook

在这里，一般使用 `lint-staged` 完成对 `git` 暂存区代码的 `eslint` 与 `prettier` 校验。

安装 `lint-staged`：

```shell
pnpm i lint-staged -D
```

添加 `package.json` 配置：

```js
"scripts": {
  // ...
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "lint:lint-staged": "lint-staged"
},
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "pnpm run lint --fix", // 记得添加 --fix
    "npx prettier --write"
  ],
  "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
    "npx prettier --write--parser json"
  ],
  "package.json": [
    "npx prettier --write"
  ],
  "*.{scss,less,styl,html}": [
    "npx prettier --write"
  ],
  "*.md": [
    "npx prettier --write"
  ]
},
// ...
```

然后，执行下列命令创建一个 `pre-commit` hook：

```shell
npx husky add .husky/pre-commit "pnpm run lint:lint-staged"
```

#### 添加 commit-msg hook

在 `commit-msg` hook，通常设置提交信息规范对 `commit` 信息进行规范校验。

```shell
pnpm install @commitlint/config-conventional @commitlint/cli -D
```

在项目根目录下新建 `commitlint.config.cjs` 配置文件，并执行命令添加 `commit-msg` hook：

```shell
npx husky add .husky/commit-msg "npx --no -- commitlint --edit ${1}"
```

接下来，在 `commitlint.config.cjs` 中设置提交信息规范，推荐使用 Angular 规范：

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'build', // 编译相关修改，例如发布版本、项目构建或者依赖的改动
      'feat', // 添加新功能
      'fix', // 修复bug
      'update', // 更新某功能
      'refactor', // 重构
      'docs', // 文档
      'chore', // 构建过程或辅助工具的变动，如添加依赖等
      'style', // 不影响代码运行的变动
      'revert', // 回滚到上一个版本
      'perf', // 性能优化
      'test', // 单元测试、集成测试等
    ],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 74],
  },
};
```

## 配置unocss

### 安装

```shell
pnpm i -D unocss @unocss/preset-attributify
pnpm i @unocss/reset
```

### 配置文件

```ts
// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss';

export default defineConfig({
  shortcuts: [
    // ...
  ],
  theme: {
    colors: {
      // ...
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      }
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()]
});
```



```ts
// vite.config.ts
import UnoCSS from 'unocss/vite';
import { presetAttributify, presetUno } from 'unocss';
export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [presetAttributify({}), presetUno()]
    })
  ],
});
```

### 解决ts类型报错

```ts
// src/html.d.ts
import type { AttributifyAttributes } from '@unocss/preset-attributify';
declare module 'react' {
  interface HTMLAttributes<T> extends AttributifyAttributes {}
}
```

### 导入

```tsx
// main.tsx
import 'uno.css';
import '@unocss/reset/normalize.css';
```



## 搭建nextjs项目

### prettier

```bash
pnpm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

### eslint

```bash
pnpm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-import-resolver-typescript
```

.eslintrc

```js
// .eslintrc
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "next",
    "next/core-web-vitals",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "import/no-anonymous-default-export": [
      "error",
      {
        "allowArray": false,
        "allowArrowFunction": true,
        "allowAnonymousClass": false,
        "allowAnonymousFunction": false,
        "allowCallExpression": true,
        "allowLiteral": false,
        "allowObject": false
      }
    ]
  }
}
```