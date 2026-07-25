# James Desktop Pet

James 是一个可分发给 Windows 用户直接使用的桌面电子宠物项目。

当前仓库已经包含：

- James 的桌宠资源与动画
- Electron 桌面程序壳
- Windows 安装版与便携版打包配置
- GitHub Actions 一键构建 `.exe` 的流程

## 本地开发

```bash
pnpm install
pnpm run dev
```

## 构建 Windows 版本

项目已配置 GitHub Actions。将仓库推送到 GitHub 后，运行 `Build Windows James Desktop Pet` 即可生成：

- `James Desktop Pet-1.0.0-x64-nsis.exe`
- `James-Desktop-Pet-1.0.0-Portable-x64.exe`

Windows 构建产物会输出到 `release/dist/`。

更详细的中文说明见：

- `release/README-zh-CN.md`
