# 图床系统前端应用

这是一个基于React开发的现代化图床系统前端应用，提供图片上传、管理、分享和下载等功能。该应用采用了React 18、Ant Design UI框架以及Emotion CSS-in-JS库构建，具有美观的界面和流畅的用户体验。

## 主要功能

- **用户认证**：支持用户注册、登录和退出功能
- **图片上传**：支持拖拽上传和点击选择上传图片
- **图片管理**：查看、删除个人上传的图片
- **文件分享**：生成分享链接，方便他人访问和下载
- **下载统计**：查看热门下载榜，了解最受欢迎的文件
- **共享文件**：浏览和下载他人分享的文件
- **数据统计**：首页展示个人文件统计信息，包括总文件数、下载次数、分享数量和存储空间使用情况

## 技术栈

- **前端框架**：React 18
- **UI组件库**：Ant Design 5.x
- **路由管理**：React Router DOM
- **HTTP客户端**：Axios
- **样式处理**：Emotion
- **文件处理**：SparkMD5（用于计算文件MD5值）
- **构建工具**：Create React App

## 项目结构

```
src/
├── components/          # 公共组件
│   └── NavBar.js       # 导航栏组件
├── config/             # 配置文件
│   └── index.js        # API配置
├── contexts/           # React Context
│   └── AuthContext.js  # 认证状态管理
├── pages/              # 页面组件
│   ├── Home.js         # 首页
│   ├── ImageList.js    # 图片列表页
│   ├── Login.js        # 登录/注册页
│   ├── SharedFiles.js  # 共享文件页
│   └── TopDownloads.js # 热门下载页
├── services/           # API服务
│   ├── auth.js         # 认证相关API
│   ├── dashboard.js    # 仪表板API
│   ├── images.js       # 图片相关API
│   └── share.js        # 分享相关API
└── theme.js            # 主题配置
```

## 快速开始

### 环境要求

- Node.js 14.x 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `build` 目录中。

## API配置

项目后端API配置位于 `src/config/index.js` 文件中：

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://49.235.167.247:8080',
  STORAGE_URL: 'http://172.17.0.2:80',
  ENDPOINTS: {
    LOGIN: '/api/login',
    REGISTER: '/api/reg',
    MY_FILES: '/api/myfiles',
    UPLOAD: '/api/upload',
    DEAL_FILE: '/api/dealfile'
  }
};
```

## 认证流程

应用使用React Context API管理用户认证状态：

1. 用户登录后，用户信息（包括token）会存储在AuthContext中
2. 用户信息同时会保存在localStorage中，实现持久化
3. 导航栏会根据用户登录状态显示不同的选项

## 图片上传流程

1. 用户选择或拖拽图片到上传区域
2. 系统计算图片的MD5值
3. 通过API将图片上传到服务器
4. 上传成功后，图片列表会自动刷新

## 分享功能

1. 用户点击图片卡片上的分享按钮
2. 系统生成包含文件ID的分享链接
3. 链接被复制到剪贴板，用户可分享给他人
4. 访问分享链接的人可以查看和下载图片

## 开发说明

- 使用Ant Design组件库构建UI界面
- 使用Emotion进行样式管理，实现动态主题
- 使用React Hooks管理组件状态
- 采用模块化结构，便于维护和扩展

## 许可证

[MIT](LICENSE)
