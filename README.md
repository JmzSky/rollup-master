# rollup 搭建打包 JS

## 前言

rollup 采用 es6 原生的模块机制进行模块的打包构建，rollup 更着眼于未来，对 commonjs 模块机制不提供内置的支持，是一款更轻量的打包工具。rollup 比较适合打包 js 的 sdk 或者封装的框架等，例如，vue 源码就是 rollup 打包的。而 webpack 比较适合打包一些应用，例如 SPA 或者同构项目等等。


## 安装 Rollup

通过下面的命令安装 [Rollup](https://www.rollupjs.com/guide/zh#introduction):

```bash
npm install --save-dev rollup
```

## 创建配置文件

在 hey-rollup 文件夹中创建一个新文件 rollup.config.js。之后在文件中添加下面的内容：

```js
export default {
  input: "src/main.js",
  output: {
    file: "dist/js/main.min.js",
    format: "umd",
    name: 'bundle-name'
  }
};
```

下面是每一个配置选项都做了些什么：

- input —— 要打包的文件

- output.file —— 输出的文件 (如果没有这个参数，则直接输出到控制台)

- output.format —— Rollup 输出的文件类型 (amd, cjs, es, iife, umd)

> amd – 异步模块定义，用于像 RequireJS 这样的模块加载器
> cjs – CommonJS，适用于 Node 和 Browserify/Webpack
> es – 将软件包保存为 ES 模块文件
> iife – 一个自动执行的功能，适合作为`<script>`标签。（如果要为应用程序创建一个捆绑包，您可能想要使用它，因为它会使文件大小变小。）
> umd – 通用模块定义，以 amd，cjs 和 iife 为一体

- output.name --生成包名称，代表你的 iife/umd 包，同一页上的其他脚本可以访问它（iife/umd 没有 name 会报错的）


### 安装对应编译的npm模块
```
## 安装 rollup.js 编译本地开发服务插件
npm i --save-dev rollup-plugin-serve

## 安装 rollup.js 编译代码混淆插件
npm i --save-dev rollup-plugin-uglify

## 安装 rollup.js 编译ES6+的 babel 模块
npm i --save-dev rollup-plugin-babel babel-core babel-preset-env babel-plugin-transform-object-rest-spread
```

## 安装插件
rollup.js编译源码中的模块引用默认只支持 ES6+的模块方式import/export。然而大量的npm模块是基于CommonJS模块方式，这就导致了大量 npm 模块不能直接编译使用。所以辅助rollup.js编译支持 npm模块和CommonJS模块方式的插件就应运而生。

npm 生态已经繁荣了多年，commonjs 规范作为 npm 的包规范，大量的 npm 包都是基于 commonjs 规范来开发的，因此在完美支持 es6 模块规范之前，我们仍旧需要兼容 commonjs 模块规范。

rollup 提供了插件 [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs)，以便于在 rollup 中引用 commonjs 规范的包。该插件的作用是将 commonjs 模块转成 es6 模块。

rollup-plugin-commonjs 通常与 [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) 一同使用，后者用来解析依赖的模块路径。

### rollup-plugin-commonjs 支持CommonJS的模块引用的rollup.js插件

```bash
npm install --save-dev rollup-plugin-commonjs rollup-plugin-node-resolve
```

> 注意： jsnext 表示将原来的 node 模块转化成 ES6 模块，main 和 browser 则决定了要将第三方模块内的哪些代码打包到最终文件中。

### rollup-plugin-node-resolve 支持npm模块引用的rollup.js插件

[rollup-plugin-replace](https://github.com/rollup/rollup-plugin-replace) 本质上是一个用来查找和替换的工具。它可以做很多事，但对我们来说只需要找到目前的环境变量并用实际值来替代就可以了。（例如：在 bundle 中出现的所有 ENV 将被 "production" 替换）

```bash
npm install --save-dev rollup-plugin-replace
```

## 压缩 bundle

添加 UglifyJS 可以通过移除注上释、缩短变量名、重整代码来极大程度的减少 bundle 的体积大小 —— 这样在一定程度降低了代码的可读性，但是在网络通信上变得更有效率。


用下面的命令来安装 [rollup-plugin-uglify](https://github.com/TrySound/rollup-plugin-uglify)：

```bash
npm install --save-dev rollup-plugin-uglify
//配合terser
npm install --save-dev rollup-plugin-terser
```

## 完整配置

最后附上我的 rollup.config.js 配置

```js
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import eslint from 'rollup-plugin-eslint'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from "rollup-plugin-terser";

import pkg from './package.json'

const isProd = process.env.NODE_ENV === 'production'
const basePlugins = [
    // eslint检查
    eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['src/js/**'],
        exclude: ['node_modules/**']
    }),
    // 替换源文件内容
    replace({
        delimiters: ['{{', '}}'],
        DEVELOPMENT: process.env.NODE_ENV,
        VERSION: pkg.version
    }),
    // 解决第三方模块依赖
    nodeResolve({
        jsnext: true,
        main: true,
        browser: true
    }),
    // commonjs转es6模块
    commonjs(),
    // 解析babel语法
    babel({
        exclude: 'node_modules/**'
    })
]
const devPlugins = []
const prodPlugins = [
    // 压缩文件
    terser()
]

let plugins = [...basePlugins].concat(isProd ? prodPlugins : devPlugins)
const entryFile = './src/index.js'
const destFile = isProd ? './dist/jsdk.min.js' : './dist/jsdk.js'

export default {
    entry: entryFile,
    format: 'umd',
    dest: destFile,
    moduleName: pkg.name,
    sourceMap: isProd,
    plugins: plugins
}
```

## 注意点

[rollup打包js的注意点](https://juejin.im/post/5beae896f265da61682aebae)
