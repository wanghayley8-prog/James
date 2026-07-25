# James Windows 版使用说明

## 这是什么

这是 James 的 Windows 桌面电子宠物打包工程。会生成两种文件：

- 安装版：`James Desktop Pet-1.0.0-x64-nsis.exe`
- 便携版：`James-Desktop-Pet-1.0.0-Portable-x64.exe`

生成后的文件会出现在项目根目录下的 `release/dist/`。

## Windows 用户如何安装或运行

### 安装版

1. 双击 `James Desktop Pet-1.0.0-x64-nsis.exe`
2. 按提示选择安装目录并完成安装
3. 安装后双击桌面快捷方式，或从开始菜单启动 `James Desktop Pet`

### 便携版

1. 双击 `James-Desktop-Pet-1.0.0-Portable-x64.exe`
2. 程序会直接运行，不需要额外安装 Node.js、Python 或其他开发环境

## 如何操作 James

- 左键点击角色：挥手
- 左键拖动角色：移动到你想放的位置
- 右键点击角色：打开更多操作菜单
- 鼠标移动到角色上方：会显示 `暂停` 和 `退出` 按钮

## 如何彻底退出

可以使用下面任意一种方式：

1. 把鼠标移到角色上方，点击 `退出`
2. 右键角色后点击 `退出`
3. 在系统托盘图标上右键，点击 `退出 James`

点击退出后会彻底关闭程序，不会继续在后台运行。

## 在 Mac 上一键生成 Windows 安装包

这台 Mac 不适合直接稳定产出 Windows `.exe`，项目已经附带 GitHub Actions 自动构建。

### 最简单的做法

1. 把当前项目上传到 GitHub 仓库
2. 打开仓库的 `Actions`
3. 运行 `Build Windows James Desktop Pet`
4. 构建完成后，在该任务的 `Artifacts` 下载 `james-desktop-pet-windows`

下载后的压缩包里会包含安装版和便携版。
