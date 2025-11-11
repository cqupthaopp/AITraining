# AI Travel Planner - 智能旅行规划师

一个基于AI的智能旅行规划应用，帮助用户轻松规划旅行行程、管理预算，并提供个性化的旅行建议。

界面展示如下

![image](https://youke1.picui.cn/s1/2025/11/11/69132af8a81c4.png)

## 功能特性

### 核心功能
- **智能行程规划**：利用阿里云百炼大模型生成详细的旅行计划，包括每日行程安排、景点推荐
- **语音输入支持**：支持通过语音输入旅行需求，自动解析并生成行程
- **费用预算管理**：创建预算、记录支出、分析预算使用情况
- **地图可视化**：基于地图的UI界面，直观展示行程地点和路线
- **用户管理**：注册、登录、个人资料管理和API密钥配置

### 技术亮点
- 前后端分离架构，React + Node.js全栈开发
- 集成阿里云百炼大模型API，提供智能行程生成
- Mapbox地图可视化，提供良好的地理交互体验
- 响应式设计，支持多种设备访问
- Docker容器化部署，支持CI/CD自动化构建

## 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **状态管理**：Zustand
- **UI组件库**：Material-UI (MUI)
- **地图可视化**：Mapbox GL JS
- **语音识别**：React Speech Recognition
- **图表库**：Recharts
- **构建工具**：Vite

### 后端
- **服务器**：Node.js + Express
- **数据库**：MongoDB + Mongoose
- **认证**：JWT (JSON Web Token)
- **API集成**：阿里云百炼大模型API

### 部署
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions
- **镜像仓库**：阿里云容器镜像服务

## Docker部署指南

### 快速运行（推荐）

1. **确保Docker已安装**
   - 确保您的系统已安装Docker和Docker Compose
   - 验证安装：`docker --version` 和 `docker-compose --version`

2. **Docker镜像**
```bash
github文件中的tar文件
```

## 本地开发环境设置

### 前提条件
- Node.js 16+
- MongoDB 5.0+
- Docker (可选，用于容器化部署)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-travel-planner
```

2. **设置环境变量**
```bash
# 复制环境变量示例文件并填写相关配置
cp .env.example .env
```

3. **安装依赖并启动开发服务器**

```bash
# 安装根目录依赖
npm install

# 启动前端开发服务器（新终端）
npm run dev:frontend

# 启动后端开发服务器（新终端）
npm run dev:backend
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 阿里云百炼API密钥配置

### 为助教提供的API密钥（3个月内有效）

为方便助教测试，我们提供了以下阿里云百炼API密钥：

```
API Key: sk-2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8
API Secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q
```

**使用方法**：
1. 注册并登录应用
2. 点击左侧菜单栏的「设置」
3. 在「API密钥配置」部分粘贴上述API密钥
4. 点击「保存」按钮
5. 验证成功后，即可使用AI生成旅行计划功能

### 获取自己的API密钥

如果您想使用自己的API密钥：
1. 访问 [阿里云百炼平台](https://dashscope.aliyun.com/)
2. 注册账号并创建API密钥
3. 按照上述步骤在应用中配置您的密钥

## 项目结构

```
ai-travel-planner/
├── client/                # 前端React应用
│   ├── src/               # 源代码
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # 状态管理
│   │   ├── App.tsx        # 应用入口组件
│   │   └── main.tsx       # 应用入口文件
│   ├── public/            # 静态资源
│   └── vite.config.ts     # Vite配置
├── server/                # 后端Node.js应用
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   ├── middleware/        # 中间件
│   └── index.js           # 服务器入口
├── Dockerfile             # Docker构建文件
├── docker-compose.yml     # Docker Compose配置
└── .github/workflows/     # GitHub Actions工作流
```

## API文档

### 认证相关接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/me` - 更新用户信息
- `PUT /api/auth/api-keys/alicloud` - 保存阿里云API Key

### 旅行计划相关接口
- `GET /api/plans` - 获取用户的所有旅行计划
- `POST /api/plans` - 创建新的旅行计划
- `GET /api/plans/:id` - 获取单个旅行计划详情
- `PUT /api/plans/:id` - 更新旅行计划
- `DELETE /api/plans/:id` - 删除旅行计划

### AI服务相关接口
- `POST /api/ai/generate-plan` - 生成旅行计划
- `POST /api/ai/process-voice` - 处理语音输入
- `POST /api/ai/analyze-budget` - 分析预算

## Docker镜像信息

- **镜像名称**: `registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/app`
- **标签**: `latest`
- **仓库地址**: [阿里云容器镜像服务](https://cr.console.aliyun.com/)
- **构建方式**: 多阶段构建，优化镜像大小和性能
- **支持平台**: linux/amd64

## 常见问题

### 1. 无法连接数据库
- 确保MongoDB容器正在运行
- 检查环境变量中的数据库连接字符串
- 查看应用日志：`docker logs ai-travel-planner`

### 2. AI生成计划失败
- 检查阿里云API密钥是否正确配置
- 确保API密钥未过期
- 验证网络连接是否正常

### 3. 应用无法启动
- 检查端口是否被占用
- 查看容器日志获取详细错误信息
- 确保所有依赖服务都已启动

## 许可证

MIT License