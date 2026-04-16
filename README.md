# OpenClaw Skill Evolution Hook

Hermes-style skill self-evolution for OpenClaw. 自动检测成功的工具调用模式，写为可复用的 Skill 文件。

## 安装

**方式一：npm 安装（推荐）**

```bash
npm install -g openclaw-skill-evolution
openclaw gateway restart
```

**方式二：Git clone**

```bash
git clone https://github.com/winsonwq/openclaw-skill-evolution.git ~/.openclaw/hooks/openclaw-skill-evolution
openclaw gateway restart
```

## 配置

`~/.openclaw/configs/skill-evolution.json`:

```json
{
  "enabled": true,
  "threshold": 3,
  "skill_dir": "~/.openclaw/workspace/skills",
  "log_level": "INFO",
  "notify_on_update": true,
  "exclude_patterns": []
}
```

| 字段 | 默认值 | 说明 |
|---|---|---|
| `threshold` | 3 | 同一工具连续成功多少次后生成 skill |
| `log_level` | INFO | DEBUG / INFO / WARN / ERROR |
| `exclude_patterns` | [] | 这些工具名不学习 |

## 调试

```bash
# 实时日志
tail -f ~/.openclaw/logs/skill-evolution.log

# 设为 DEBUG 模式
echo '{"log_level":"DEBUG"}' > ~/.openclaw/configs/skill-evolution.json

# 重启后生效
openclaw gateway restart
```

## 开发

```bash
npm install
npm test
npm run build
```

## 卸载

```bash
npm uninstall -g openclaw-skill-evolution
# 或
rm -rf ~/.openclaw/hooks/openclaw-skill-evolution
openclaw gateway restart
```

Skill 文件保留在 `~/.openclaw/workspace/skills/`，手动删除。
