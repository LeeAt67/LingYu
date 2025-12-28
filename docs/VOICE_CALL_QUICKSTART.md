# 语音通话功能快速启动指南

## 🚀 5 分钟快速开始

### 步骤 1：配置 API 密钥

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录账号
3. 创建 API 密钥
4. 复制 API 密钥

5. 在 `Neo/server/.env` 文件中配置：

```bash
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤 2：更新数据库

```bash
cd Neo/server
pnpm run db:generate
pnpm run db:push
```

### 步骤 3：启动服务

```bash
# 在 Neo 根目录
pnpm run dev
```

这将启动：

- 前端：http://localhost:3000
- 后端：http://localhost:5000

### 步骤 4：测试功能

1. 打开浏览器访问 http://localhost:3000
2. 登录账号（如果没有账号，先注册）
3. 进入任意聊天会话
4. 点击顶部导航栏的 **📞 电话图标**
5. 允许浏览器访问麦克风权限
6. 开始说话，AI 会实时回复！

## ✅ 功能检查清单

测试以下功能确保一切正常：

- [ ] 点击电话图标打开语音通话模态框
- [ ] 允许麦克风权限后连接成功
- [ ] 说话时看到输入音频波形
- [ ] AI 回复时听到语音并看到输出波形
- [ ] 转录文本实时显示在界面上
- [ ] 点击静音按钮可以关闭/开启麦克风
- [ ] 说话时可以打断 AI 的回复
- [ ] 点击结束通话按钮关闭连接
- [ ] 对话历史保存到数据库

## 🐛 常见问题快速解决

### 问题 1：无法连接

**症状**：点击开始通话后显示"连接失败"

**解决方案**：

```bash
# 检查后端是否运行
curl http://localhost:5000/health

# 检查环境变量
cat Neo/server/.env | grep DASHSCOPE

# 查看后端日志
cd Neo/server
pnpm run dev
```

### 问题 2：无法访问麦克风

**症状**：提示"无法访问麦克风"

**解决方案**：

1. 检查浏览器地址栏左侧的权限图标
2. 确保允许麦克风权限
3. 刷新页面重新授权
4. 确保没有其他应用占用麦克风

### 问题 3：AI 无响应

**症状**：说话后 AI 没有回复

**解决方案**：

```bash
# 检查API密钥是否有效
# 在浏览器控制台查看错误信息

# 检查DashScope账户余额
# 访问 https://dashscope.console.aliyun.com/

# 查看后端日志
cd Neo/server
pnpm run dev
```

### 问题 4：音频卡顿

**症状**：AI 语音播放不流畅

**解决方案**：

1. 检查网络连接质量
2. 关闭其他占用带宽的应用
3. 尝试刷新页面
4. 检查 CPU 使用率

## 📊 性能监控

### 浏览器控制台

打开浏览器开发者工具（F12），查看：

- Console：查看日志和错误信息
- Network：查看 WebSocket 连接状态
- Performance：查看性能指标

### 后端日志

```bash
cd Neo/server
pnpm run dev

# 查看日志输出
# ✅ WebSocket 连接已建立
# ✅ 语音会话已创建
# ✅ 转录已保存
```

## 🎯 测试场景

### 场景 1：基本对话

1. 开始通话
2. 说："你好，请介绍一下自己"
3. 等待 AI 回复
4. 结束通话

### 场景 2：语音打断

1. 开始通话
2. 说一个长问题让 AI 回答
3. 在 AI 说话时立即开口打断
4. 观察 AI 是否立即停止

### 场景 3：静音功能

1. 开始通话
2. 点击静音按钮
3. 说话（AI 不应该听到）
4. 取消静音
5. 再次说话（AI 应该能听到）

### 场景 4：长时间通话

1. 开始通话
2. 进行 5-10 分钟的对话
3. 检查是否有内存泄漏
4. 检查音频质量是否稳定

## 🔧 开发调试

### 启用详细日志

在 `Neo/server/.env` 中：

```bash
LOG_LEVEL=debug
```

### 查看 WebSocket 消息

在浏览器控制台：

```javascript
// 查看发送的消息
console.log("发送:", message);

// 查看接收的消息
console.log("接收:", data);
```

### 检查音频流

```javascript
// 在浏览器控制台
const store = useVoiceCallStore.getState();
console.log("状态:", store.status);
console.log("消息:", store.messages);
console.log("错误:", store.error);
```

## 📱 移动端测试

虽然主要针对桌面端，但也可以在移动端测试：

1. 确保使用 HTTPS（或 localhost）
2. 使用 Chrome 或 Safari 浏览器
3. 允许麦克风权限
4. 注意移动网络可能不稳定

## 🎓 学习资源

- [阿里云 DashScope 文档](https://help.aliyun.com/zh/dashscope/)
- [Qwen-Omni API 文档](https://help.aliyun.com/zh/dashscope/developer-reference/qwen-omni-realtime)
- [Web Audio API 教程](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebSocket 教程](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 💡 使用技巧

1. **清晰发音**：说话清晰，避免背景噪音
2. **合适距离**：保持麦克风距离适中
3. **稳定网络**：使用稳定的网络连接
4. **及时打断**：需要打断时立即开口
5. **查看转录**：通过转录文本确认识别准确性

## 🎉 开始使用

现在你已经准备好了！点击电话图标，开始你的第一次 AI 语音对话吧！

如有问题，请查看：

- [详细使用指南](./VOICE_CALL_GUIDE.md)
- [实现总结](./VOICE_CALL_IMPLEMENTATION_SUMMARY.md)
- [项目 README](../README.md)

---

**祝你使用愉快！** 🚀
