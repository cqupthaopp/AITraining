# 多阶段构建 - 第一阶段：构建前端
FROM node:16-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app

# 复制前端文件
COPY client/package*.json ./
COPY client/ ./

# 安装依赖并构建前端
RUN npm install --legacy-peer-deps && npm run build

# 第二阶段：构建后端并提供服务
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制后端文件
COPY server/package*.json ./
COPY server/ ./

# 复制构建好的前端到后端的public目录
RUN mkdir -p ./public
COPY --from=frontend-builder /app/dist ./public

# 复制环境变量配置示例
COPY .env.example ./.env.example

# 创建日志目录
RUN mkdir -p ./logs

# 设置生产环境变量
ENV NODE_ENV=production

# 设置npm镜像源（国内加速）
RUN npm config set registry https://registry.npmmirror.com

# 安装后端依赖（不包含开发依赖）
RUN npm install --production

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["node", "index.js"]