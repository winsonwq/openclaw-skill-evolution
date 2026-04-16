---
name: openclaw-skill-evolution
description: "Hermes-style skill self-evolution. Detects successful tool patterns and writes them as reusable Skills. Trigger: same tool succeeds 3 times."
metadata:
  openclaw:
    emoji: "🧬"
    events:
      - gateway:startup
      - message:preprocessed
    os: ["linux", "darwin", "win32"]
    requires:
      bins: ["node"]
---

# OpenClaw Skill Evolution Hook

自动检测成功的工具调用模式，写为可复用的 Skill 文件。

## 工作流程

1. 监听 `message:preprocessed`，解析工具调用结果
2. 同一工具连续成功 3 次 → 触发 skill 生成
3. 分析对话历史，提取 pattern 写入 `workspace/skills/<name>/SKILL.md`
4. 通知用户重启 Gateway 加载新 skill

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

## 调试

```bash
# 查看日志
tail -f ~/.openclaw/logs/skill-evolution.log

# 设为 DEBUG 模式
echo '{"log_level":"DEBUG"}' > ~/.openclaw/configs/skill-evolution.json
```

## 状态文件

- `patterns/registry.json` — 所有学会的 pattern
- `~/.openclaw/logs/skill-evolution.log` — 运行日志
