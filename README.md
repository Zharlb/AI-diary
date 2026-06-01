# 📅 日历日记 - Calendar Diary

一个简洁美观的日历日记应用，支持富文本编辑、快捷选项管理、数据持久化存储。

## ✨ 功能特点

### 📝 日记管理
- 📅 日历视图展示，按周/月切换
- 📝 富文本编辑器，支持富文本编辑
- 🏷️ 标签管理，快速分类
- 🎨 多彩主题，自定义日记颜色
- 📝 市场记录，支持快捷选项标记

### ⚡ 快捷选项
- 📂 类别管理，自定义分类
- 🔗 快捷选项，支持快速添加常用内容
- 🗑️ 一键删除，管理方便

### 💾 数据存储
- 📁 文件系统存储，JSON 格式
- 📅 按日期拆分，结构清晰
- 🔄 实时同步，无需手动保存

### 🎨 界面设计
- 📱 响应式布局，支持移动端和桌面端
- 🌙 优雅的视觉设计
- 🎯 直观的用户交互
- 📜 自定义滚动条样式

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **状态管理**: Pinia
- **富文本编辑器**: WangEditor
- **样式**: SCSS

### 后端
- **框架**: Koa.js
- **路由**: koa-router
- **数据解析**: koa-bodyparser
- **跨域支持**: @koa/cors

## 📁 项目结构

```
/workspace/
├── data/                      # 数据存储目录
│   ├── diaries/              # 日记数据（按日期拆分）
│   │   ├── 2026-06-01.json
│   │   └── 2026-06-04.json
│   └── quickOptions.json     # 快捷选项配置
│
├── server/                    # 后端服务
│   ├── index.js             # 服务器入口
│   ├── routes/              # 路由模块
│   │   ├── diaries.js       # 日记接口
│   │   └── quickOptions.js  # 快捷选项接口
│   └── utils/               # 工具模块
│       └── fileHelper.js    # 文件操作工具
│
├── src/                      # 前端源码
│   ├── api/                 # API 服务层
│   │   └── index.js
│   ├── components/         # Vue 组件
│   │   ├── CalendarList.vue
│   │   ├── CalendarToolbar.vue
│   │   ├── ConfirmModal.vue
│   │   ├── DiaryEditor.vue
│   │   └── QuickOptionsManager.vue
│   ├── stores/              # Pinia 状态管理
│   │   └── diary.js
│   ├── App.vue
│   ├── main.js
│   └── style.scss
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

### 启动服务

```bash
# 启动后端服务（端口 3000）
cd server
npm start

# 启动前端开发服务器（端口 5173）
npm run dev
```

### 访问应用
- 前端地址: http://localhost:5173
- 后端 API: http://localhost:3000

## 📡 API 接口

### 日记接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/diaries` | 获取所有日记 |
| GET | `/api/diaries/:id` | 获取指定日记 |
| POST | `/api/diaries` | 创建日记 |
| PUT | `/api/diaries/:id` | 更新日记 |
| DELETE | `/api/diaries/:id` | 删除日记 |

### 快捷选项接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/quick-options` | 获取所有快捷选项 |
| POST | `/api/quick-options/categories` | 添加类别 |
| PUT | `/api/quick-options/categories/:id` | 更新类别 |
| DELETE | `/api/quick-options/categories/:id` | 删除类别 |
| POST | `/api/quick-options/categories/:id/options` | 添加选项 |
| DELETE | `/api/quick-options/categories/:id/options/:option` | 删除选项 |

## 📝 数据格式

### 日记数据 (data/diaries/YYYY-MM-DD.json)

```json
[
  {
    "id": "mpuu2tmqka8ammsm6",
    "title": "日记标题",
    "summary": "日记摘要",
    "content": "富文本内容",
    "tags": ["标签1", "标签2"],
    "color": "#4080ff",
    "date": "2026-06-04",
    "createdAt": "2026-06-01T06:34:33.986Z",
    "updatedAt": "2026-06-01T06:34:33.986Z"
  }
]
```

### 快捷选项数据 (data/quickOptions.json)

```json
{
  "categories": [
    {
      "id": "mpuu2bmu1eeybsi5a",
      "name": "心情",
      "options": ["开心", "难过", "平静"],
      "createdAt": "2026-06-01T06:34:10.662Z"
    }
  ],
  "labels": {}
}
```

## 🎯 使用说明

### 创建日记
1. 在日历中选择日期
2. 点击添加按钮创建新日记
3. 填写标题、摘要，选择颜色
4. 使用富文本编辑器编写内容
5. 点击保存

### 管理快捷选项
1. 点击工具栏的管理按钮
2. 添加新类别（系统自动生成唯一标识）
3. 在类别中添加常用选项
4. 支持编辑和删除类别

### 市场记录
1. 编辑日记时，点击快捷选项
2. 选择类别和选项
3. 自动填充到日记中

## 🔧 开发指南

### 添加新组件
1. 在 `src/components/` 目录创建 `.vue` 文件
2. 在需要使用的页面导入组件
3. 注册并使用

### 添加新接口
1. 在 `server/routes/` 目录创建或修改路由文件
2. 在 `server/index.js` 中注册路由
3. 在 `src/api/index.js` 中添加前端调用方法

### 数据迁移
- 日记数据按日期自动拆分存储
- 现有数据会自动迁移到新结构

## 📄 License

MIT License
