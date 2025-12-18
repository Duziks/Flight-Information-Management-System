# Flight Information Management System

> 简体中文文档 — 前后端分离的航班信息管理系统 (Uni-app + Express)

## 简介 ✅
本项目包含两个子项目：
- `flight2`：前端，基于 **uni-app (Vue 3)**，用于 H5 / 小程序 等多端构建。
- `flightbackend`：后端，基于 **Express** 提供简单的 REST API，使用本地 JSON 文件（`db.json`、`cities.json`）做持久化存储。

---

## 目录结构 📁
```
flight2/         # 前端（uni-app）
flightbackend/    # 后端（Express）
```

---

## 环境要求 🔧
- Node.js (建议 >= 14)
- npm 或 yarn
- 推荐工具：VS Code、Postman / curl（调试 API）

---

## 本地运行指南 ▶️

### 1) 启动后端（`flightbackend`）
1. 进入目录：
```bash
cd flightbackend
```
2. 安装依赖：
```bash
npm install
```
3. 启动服务器：
```bash
node server.js
```
或者（推荐）在 `package.json` 中添加脚本：
```json
"scripts": {
  "start": "node server.js"
}
```
然后运行：
```bash
npm run start
```
4. 默认监听：`http://localhost:3000`

> Tip: 开发中可安装 `nodemon` 让服务自动重启：`npm i -D nodemon`，并使用 `npx nodemon server.js`。

---

### 2) 启动前端（`flight2`）
1. 进入目录：
```bash
cd flight2
```
2. 安装依赖：
```bash
npm install
```
3. 启动 H5 开发服务器（浏览器预览）：
```bash
npm run dev:h5
```
4. 其它可用脚本（根据目标平台选择）：
- `npm run dev:h5:ssr`（SSR）
- `npm run dev:mp-weixin`（微信小程序）
- `npm run build:h5`（打包生产）

> 注意：若运行时报错提示找不到 `uni`，请确认 `node_modules` 已正确安装，或使用 `npx uni` 临时运行。

---

### 3) 同时运行
1. 先启动后端（监听 3000），再启动前端开发服务器。
2. 确保前端请求的后端地址为 `http://localhost:3000`（可在代码中配置或直接使用绝对 URL）。

---

## 后端 API 文档 （简要） 🧭
- GET /flights
  - 返回：所有航班数组
- POST /flights
  - 请求体：航班对象（JSON），示例：{ "num": "CA123", "from": "PEK", "to": "SHA", ... }
- PUT /flights/:num
  - 更新指定航班
- DELETE /flights/:num
  - 删除指定航班
- GET /cities
  - 返回城市权重列表（`cities.json`）
- POST /cities
  - 添加新城市：{ "name": "城市名", "weight": 100 }

示例 curl：
```bash
curl http://localhost:3000/flights
```

---

## 常见问题与排查 🛠️
- 后端无法启动：检查 `node` 版本、是否缺少依赖、`db.json` 文件权限。
- 端口被占用：修改 `server.js` 中的 `PORT` 或终止占用进程。
- 前端请求后端失败：确认后端已运行、CORS 已启用（当前项目启用了 CORS）、检查浏览器控制台的网络请求。
- 写入 JSON 文件失败：检查项目目录权限以及 JSON 格式是否正确。

---


