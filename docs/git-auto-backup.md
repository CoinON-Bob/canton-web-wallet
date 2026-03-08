# Git 自动备份说明

## 如何使用自动备份

在项目根目录执行：

```bash
npm run backup
```

脚本会依次执行：

1. `git add .` — 暂存所有变更
2. 若有变更则 `git commit -m "auto backup: YYYY-MM-DD HH:MM:SS"`
3. `git push origin main` — 推送到 GitHub

若无变更，会输出 `No changes to commit.` 并正常退出。

## 建议使用方式

- **每次开发告一段落后**执行一次：`npm run backup`
- 这样当前代码会自动提交并推送到 GitHub，便于版本追溯和协作。

## 首次使用前

1. 确保已配置 `origin`：
   ```bash
   git remote -v
   # 应看到 origin 指向你的 GitHub 仓库
   ```

2. 若尚未配置，添加远程仓库：
   ```bash
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   ```

3. 推送需要认证（HTTPS 时需 GitHub 账号或 Personal Access Token）。可任选其一：
   - 使用 SSH：将 `origin` 改为 `git@github.com:<用户名>/<仓库名>.git`，并配置 SSH 密钥
   - 使用 HTTPS：在首次 `git push` 时输入用户名和 Token，或配置 Git 凭证存储（切勿将 Token 提交到仓库）

## 如何恢复历史版本

### 查看历史提交

```bash
git log --oneline -20
```

### 恢复整个项目到某次提交

```bash
# 先查看要恢复的 commit hash
git log --oneline

# 硬回退到该提交（会丢弃之后的所有本地修改）
git reset --hard <commit-hash>
```

注意：若该提交之后已推送到 GitHub，恢复后需强制推送 `git push origin main --force`，请谨慎使用。

### 只恢复某个文件到某次提交

```bash
git checkout <commit-hash> -- <文件路径>
```

### 基于历史版本开新分支（推荐，不破坏 main）

```bash
git checkout -b restore-20250307 <commit-hash>
# 在新分支上修改或合并需要的改动
```

## 故障排查

- **push 被拒绝**：先执行 `git pull origin main --rebase` 再运行 `npm run backup`
- **认证失败**：检查 SSH 密钥或 HTTPS Token 是否有效、是否有仓库推送权限
- **脚本无执行权限**：`chmod +x scripts/auto_commit.sh`
