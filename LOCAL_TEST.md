# 本地测试指南

## 1. 安装依赖

```bash
npm install
```

## 2. 安装 Playwright 浏览器

```bash
npx playwright install chromium
```

## 3. 配置环境变量

复制 `.env.example` 文件为 `.env`：

**Windows:**
```bash
copy .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的真实信息：

```env
SILICONCLOUD_API_KEY=sk-your-actual-api-key
PTCAFE_USERNAME=your_ptcafe_username
PTCAFE_PASSWORD="your_ptcafe_password"
```

**重要提示：**
- 如果密码包含特殊字符（如 `#`、`$`、空格等），必须用双引号包裹
- 例如：`PTCAFE_PASSWORD="my#pass@word"`
- 用户名如果包含特殊字符也建议用双引号包裹

**获取 SiliconCloud API Key:**
1. 访问 https://cloud.siliconflow.cn/account/ak
2. 注册/登录账号
3. 创建 API Key
4. 复制到 `.env` 文件中

## 4. 运行测试

### 无头模式（后台运行）
```bash
npm test
```

### 有头模式（可以看到浏览器操作）
```bash
npm run test:headed
```

### 调试模式（逐步执行）
```bash
npm run test:debug
```

## 5. 查看结果

- 测试完成后会在项目根目录生成截图文件 `checkin-{timestamp}.png`
- 控制台会输出详细的执行日志
- 如果测试失败，检查截图和日志信息

## 注意事项

- 确保你的 SiliconCloud API Key 有足够的额度
- 确保网络可以访问 ptcafe.club 和 api.siliconflow.cn
- `.env` 文件已添加到 `.gitignore`，不会被提交到 Git
