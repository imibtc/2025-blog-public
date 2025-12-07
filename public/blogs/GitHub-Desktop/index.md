> 用 GitHub Desktop 进行同步上游等操作是比较方便的选择，以下整理了下，以便后期查看。

---

## 1️⃣ 一次性配置（只做一次）
| 步骤 | 操作 | 小白避坑实录 |
|---|---|---|
| ① 安装 | 官网下载 [GitHub Desktop](https://desktop.github.com) | 若提示“Unable to locate Git”→ 先装 [Git for Windows](https://git-scm.com)（64-bit，一路 Next）再重启 Desktop。 |
| ② 克隆 | `Clone a Repository` → 选 **你的 fork** → `Clone` | 无 |
| ③ 声明用途 | 弹出 “How to use this fork?” → 选 `For my own purposes` → `Continue` | Desktop 会自动把原仓库设为 `upstream`，别手滑关掉。 |

---

## 2️⃣ 日常同步 3 步走（每次上游更新时跑一次）

| 序号 | 动作 | 图解级指令 | 踩坑补丁 |
|---|---|---|---|
| ① 拉取上游 | 把上游最新代码合并到本地 | `Branch` → `Merge into current branch…` → 选 **`upstream/main`** → `Merge upstream/main into main` | 没看到 `upstream`？→ 第四章速查「手动添加 upstream」。 |
| ② 解决冲突（如有） | 文本文件 | 点 `Open in Editor` → 删掉所有 `<<<<<<<` / `=======` / `>>>>>>>` 整行 → 保存 → 文件变 ✅ | ① 按钮灰色 → `Repository` → `Show in Explorer` 手动用 VS Code/记事本改。<br>② 改完依旧 ❌ → 冲突标记没删干净，再检查一遍。 |
|  | 二进制（图片等） | Desktop 能预览就点 `Keep`；<br>若提示“must resolve via command line”→ `Repository` → `Open in Git Bash`：<br>`git checkout HEAD -- path/xxx.png`（保留自己的）<br>或<br>`git checkout upstream/main -- path/xxx.png`（采用上游） | 关命令行即 ✅ |
| ③ 提交 & 推送 | 写 Summary（例：`Merge upstream/main and resolve conflicts`）→ `Commit to main` → `Push origin` | 无 |

---

## 3️⃣ 成功标志
回到浏览器刷新自己的 fork，页面出现  
> “This branch is not behind … Enjoy your day!”  
即可关机走人 🎉

---

## 4️⃣ 紧急逃生舱
| 场景 | 一键救生 |
|---|---|
| 没有 `upstream` 远程 | `Repository` → `Repository settings` → `Remotes` → `Add`：<br>Name=`upstream` , URL=`原仓库地址.git` |
| 冲突爆炸想放弃 | 网页进入自己仓库 → `Sync fork` → `Discard X commits`（⚠️ 会丢本地所有改动） |
| 合并后想反悔 | Desktop：`Branch` → `Undo …` 或命令行：<br>`git reset --hard HEAD~1` |

---

## 5️⃣ 一句话口诀
**Merge → 改文本删标记 → 图片 checkout 二选一 → Commit → Push**  
把这句贴桌面，日后再冲突 5 分钟搞定！