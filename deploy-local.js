#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== AI Travel Planner 本地部署脚本 ===');
console.log('正在检查环境...');

try {
  // 检查Node.js版本
  const nodeVersion = execSync('node -v').toString().trim();
  console.log(`Node.js版本: ${nodeVersion}`);
  
  // 创建必要的目录
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
    console.log('创建日志目录: ./logs');
  }
  
  // 检查并创建.env文件
  const envPath = path.join(__dirname, 'server', '.env');
  if (!fs.existsSync(envPath)) {
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log(`已从.env.example创建.env文件`);
    } else {
      const defaultEnv = `PORT=5000\nNODE_ENV=development\nMONGODB_URI=mongodb://localhost:27017/ai-travel-planner\nJWT_SECRET=ai-travel-planner-jwt-secret-key\n`;
      fs.writeFileSync(envPath, defaultEnv);
      console.log(`已创建默认.env文件`);
    }
  }
  
  console.log('正在安装前端依赖...');
  process.chdir('./client');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('正在构建前端应用...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 复制构建产物到server/public目录
  process.chdir('../server');
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  
  const distFiles = fs.readdirSync('../client/dist');
  distFiles.forEach(file => {
    const srcPath = path.join('../client/dist', file);
    const destPath = path.join('./public', file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // 递归复制目录
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      const subFiles = fs.readdirSync(srcPath);
      subFiles.forEach(subFile => {
        fs.copyFileSync(
          path.join(srcPath, subFile), 
          path.join(destPath, subFile)
        );
      });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('前端构建产物已复制到server/public目录');
  
  console.log('正在安装后端依赖...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n=== 部署完成！准备启动应用 ===');
  console.log('请确保MongoDB服务正在运行（mongodb://localhost:27017）');
  console.log('正在启动应用服务器...');
  
  // 启动服务器
  const server = spawn('node', ['index.js'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    console.log(`服务器已退出，退出码: ${code}`);
  });
  
  server.on('error', (err) => {
    console.error(`启动服务器时出错: ${err.message}`);
  });
  
  console.log('\n应用服务器已启动！');
  console.log('请访问 http://localhost:5000');
  
} catch (error) {
  console.error('部署过程中出错:', error.message);
  console.log('\n=== 部署失败 ===');
  console.log('请检查以下事项:');
  console.log('1. Node.js版本是否为16+');
  console.log('2. MongoDB服务是否正在运行');
  console.log('3. 是否有足够的权限执行命令');
  process.exit(1);
}
