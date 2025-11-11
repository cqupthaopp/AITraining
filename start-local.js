// 本地启动脚本 - 直接启动后端服务器
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===== AI旅行规划师 - 本地启动脚本 =====');
console.log('此脚本将帮助您在不使用Docker的情况下启动项目');

// 确保日志目录存在
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✓ 创建日志目录');
}

// 检查必要的环境变量文件
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('⚠️  未找到 .env 文件，将使用默认配置');
}

// 检查node_modules
const serverModules = path.join(__dirname, 'server', 'node_modules');
if (!fs.existsSync(serverModules)) {
  console.log('⚠️  服务器依赖未安装，正在安装...');
  try {
    process.chdir(path.join(__dirname, 'server'));
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ 服务器依赖安装完成');
    process.chdir(__dirname);
  } catch (error) {
    console.error('❌ 服务器依赖安装失败:', error.message);
    console.log('请尝试手动运行: cd server && npm install');
  }
}

// 启动服务器
console.log('\n🚀 正在启动服务器...');
console.log('服务器将运行在 http://localhost:5000');
console.log('健康检查地址: http://localhost:5000/health');
console.log('按 Ctrl+C 停止服务器\n');

try {
  // 设置环境变量（不覆盖MONGODB_URI，从.env文件读取）
  process.env.PORT = '5000';
  process.env.NODE_ENV = 'development';
  // 保留JWT_SECRET环境变量设置
  process.env.JWT_SECRET = 'ai-travel-planner-jwt-secret-key';
  
  // 启动服务器（不使用shell选项提高安全性）
  const serverProcess = require('child_process').spawn(
    'node',
    ['index.js'],
    {
      cwd: path.join(__dirname, 'server'),
      stdio: 'inherit'
    }
  );
  
  // 处理退出
  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n服务器进程退出，退出码 ${code}`);
    }
  });
  
  // 捕获中断信号
  process.on('SIGINT', () => {
    console.log('\n正在停止服务器...');
    serverProcess.kill('SIGINT');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  
} catch (error) {
  console.error('❌ 启动服务器失败:', error.message);
  console.log('请尝试手动运行: cd server && node index.js');
}