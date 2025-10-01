# 日本の自動車教習所予約ヘルパー Chrome 拡張機能

[中文 (简体) 🇨🇳](README.md) | [English 🇺🇸](README.en.md) | [日本語 🇯🇵](README.ja.md)

一个 Chrome 扩展程序，用于监控 e-license.jp 网站的预约空位并发送自动通知。

e-license.jp 是一个由多家日本驾校使用的解决方案网站，供学生预约驾驶课程。

## 功能特色

- 🔍 **自动监控**：监控驾校课程预约空位
- 📱 **即时通知**：通过 ntfy.sh 发送中文通知消息
- ⚙️ **可配置选择器**：自定义监控元素和导航链接
- 🔄 **自动刷新**：每 60 秒自动刷新页面数据
- 📊 **调试日志**：详细的运行状态和错误信息

## 安装方法

### 1. 下载扩展程序

```bash
git clone https://github.com/xiao99xiao/e-license-monitor.git
```

### 2. 载入到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「载入未封装的扩展程序」
5. 选择下载的 `checker_chrome` 文件夹

### 3. 配置通知服务

1. 下载 [ntfy.sh 应用程序](https://ntfy.sh/)
2. 订阅主题：`e-license-reserve-alert`
3. 确保应用程序在后台运行

**注意**：默认通知频道为 `e-license-reserve-alert`。如需更改频道名称，请修改 `content.js` 文件中的 ntfy URL：

```javascript
xhr.open("POST", "https://ntfy.sh/您的频道名称", true);
```

## 使用方法

### 详细操作步骤

1. **访问驾校预约系统**

   - 打开浏览器，访问您的驾校 e-license.jp 页面
   - 登录您的驾校账户
   - 导航到课程预约页面（第一阶段、第二阶段或检定预约）

2. **启动监控**

   - 点击浏览器工具栏中的扩展程序图标（E-License Monitor）
   - 在弹窗中点击「Start Monitor」按钮
   - 状态显示为「Monitoring Active」表示监控已启动
   - 扩展程序将开始监控当前页面的预约空位

3. **监控运行**

   - 扩展程序每 60 秒自动检查一次空位
   - 发现空位时会通过 ntfy.sh 发送通知
   - 可通过弹窗查看调试日志了解运行状态

4. **停止监控**
   - 点击扩展程序弹窗中的「Stop Monitor」按钮
   - 状态显示为「Monitoring Stopped」表示监控已停止

### 配置选项

#### 空位元素选择器

用于指定要监控的课程预约空位元素，根据不同阶段（第一阶段、第二阶段、检定）需要设定不同的值：

- **默认值**：`a.simei`
- **其他示例**：
  - `.available-slots`
  - `[data-slot="available"]`
  - `div.slot-item a`

#### 预约链接选择器

用于指定导航到课程预约页面的链接，根据不同阶段（第一阶段、第二阶段、检定）需要设定不同的值：

- **默认值**：`a[data-kamoku="0"]`
- **其他示例**：
  - `.dropdown-menu.show a:nth-child(3)`
  - `a[data-action="/el32/pc/reserv/p06/p06a/nav"]`

#### 配置步骤

1. 在扩展程序弹窗中修改选择器值
2. 点击「Save Configuration」保存
3. 重新启动监控以应用新配置

## 通知格式

当发现课程预约空位时，会发送以下格式的通知：

```
🎉 SLOTS AVAILABLE! 2024-01-15 10:00, 2024-01-15 14:00 😄
```

## 故障排除

### 常见问题

**Q: 监控没有发现课程空位**

- 检查选择器配置是否正确
- 查看调试日志中的错误信息
- 确认网页元素结构是否改变

**Q: 没有收到通知**

- 确认 ntfy.sh 应用程序正在运行
- 检查是否订阅了正确的频道：`e-license-reserve-alert`
- 检查网络连接
- 查看调试日志中的发送状态
- 如需使用自定义频道，请修改 `content.js` 中的 ntfy URL

**Q: 配置没有保存**

- 确保输入的选择器不为空
- 检查浏览器控制台是否有错误
- 重新载入扩展程序

### 调试信息

扩展程序提供详细的调试信息：

- 监控状态变化
- 元素检查结果
- 通知发送状态
- 错误和警告信息

## 技术规格

- **Chrome 扩展程序版本**：Manifest V3
- **权限**：`activeTab`, `storage`, `scripting`
- **支持的网站**：`*.e-license.jp/*`
- **通知服务**：ntfy.sh
- **默认通知频道**：`e-license-reserve-alert`
- **监控间隔**：60 秒

### 自定义通知频道

如需使用自定义 ntfy 频道：

1. 在 ntfy.sh 应用中订阅您的自定义频道
2. 修改 `content.js` 文件中的两处 ntfy URL：

   ```javascript
   // 在 sendAlert 函数中 (约第 215 行)
   xhr.open("POST", "https://ntfy.sh/您的频道名称", true);

   // 在 sendUrgentAlert 函数中 (约第 275 行)
   xhr.open("POST", "https://ntfy.sh/您的频道名称", true);
   ```

3. 重新载入扩展程序

## 开发信息

### 文件结构

```
/
├── manifest.json          # 扩展程序清单
├── background.js           # 后台脚本
├── content.js             # 内容脚本
├── popup.html             # 弹窗界面
├── popup.js               # 弹窗逻辑
└── images/                # 扩展程序图标
```

### 主要功能

- **监控流程**：检查页面元素 → 发送通知 → 自动刷新
- **状态管理**：使用 Chrome 存储 API 持久化配置
- **消息通信**：弹窗 ↔ 后台脚本 ↔ 内容脚本

## 授权

本项目仅供学习和研究使用。请遵守相关网站的使用条款。

## 贡献

欢迎提交问题报告和功能建议！

---

**注意**：此扩展程序仅在 e-license.jp 网站上工作，请确保您有驾校账户并有权访问该网站。
