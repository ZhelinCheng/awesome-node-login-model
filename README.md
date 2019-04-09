# ✨ 网站模拟登录（Node.js）
![GitHub package.json version](https://img.shields.io/github/package-json/v/ZhelinCheng/awesome-node-login-model.svg)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D3.0-green.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D7.6.0-green.svg)](https://nodejs.org/en/)
![GitHub](https://img.shields.io/github/license/ZhelinCheng/awesome-node-login-model.svg)

生活中我经常需要用到爬虫，因为数据量不是太大，所以一直是自己手动登录。受到[awesome-python-login-model](https://github.com/CriseLYJ/awesome-python-login-model)项目的启发，
我觉得有必要将我掌握的知识沉淀下来，所以我决定用Node去完成。不过项目刚创建，处于不停更新当中！

## 起步
项目使用TypeScript编写，所以你需要对其有所了解。
### 安装依赖
 ```shell
 npm i 
 ```
 or
 ```shell
 yarn install
 ```
 ### 开发
```shell
npm run dev
```
### 构建
将会将项目打包至dist目录：
```shell
npm run build
```
 

## 关于
模拟登录将采用直接登录或者Puppeteer（谷歌的无头浏览器）的方式进行，这将会根据网站登录的难易成度而定。

## 计划
- [x] [Bilibili](https://www.bilibili.com/)
- [ ] [微博网页版](http://weibo.com)
- [ ] [知乎](http://zhihu.com)
- [ ] [Baidu](www.baidu.com)

## 目录
- [x] [Bilibili](https://github.com/ZhelinCheng/awesome-node-login-model/tree/ts/src/lib/bilibili)