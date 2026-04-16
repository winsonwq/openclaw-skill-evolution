import * as fs from 'fs'
import * as path from 'path'
import { PatternEntry, SkillFrontmatter } from './types'
import { logger } from './logger'

export class SkillBuilder {
  constructor(private skillDir: string) {}

  private escapeFrontmatter(value: string): string {
    // Escape special chars in frontmatter values
    return value.replace(/"/g, '\\"')
  }

  private formatFrontmatter(fm: SkillFrontmatter): string {
    return `---
name: "${this.escapeFrontmatter(fm.name)}"
description: "${this.escapeFrontmatter(fm.description)}"
trigger: "${this.escapeFrontmatter(fm.trigger)}"
auto_learned: ${fm.auto_learned}
learned_at: "${fm.learned_at}"
source_pattern: "${fm.source_pattern}"
---

# ${fm.name}

${fm.description}

## 使用场景

${fm.trigger}

## 使用方法

通过 OpenClaw Skill 机制调用。

## 示例

\`\`\`bash
${fm.tool_sequence.join('\n')}
\`\`\`

---
*此文件由 openclaw-skill-evolution 自动生成，Gateway 重启后生效*
`
  }

  async build(pattern: PatternEntry): Promise<string> {
    const skillName = this.sanitizeName(pattern.tool_name)
    const fm = {
      name: skillName,
      description: `自动学会的工具模式：连续 ${pattern.success_count} 次成功执行 ${pattern.tool_name}`,
      trigger: `连续 ${pattern.success_count} 次成功执行 ${pattern.tool_name} 后自动学习`,
      auto_learned: true,
      learned_at: pattern.last_seen,
      source_pattern: pattern.tool_name,
      tool_sequence: pattern.tool_sequence,
    }

    const skillContent = this.formatFrontmatter(fm)
    const skillPath = path.join(this.skillDir, skillName, 'SKILL.md')

    try {
      const dir = path.dirname(skillPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      await fs.promises.writeFile(skillPath, skillContent, 'utf-8')
      logger.info('skill-builder', `wrote SKILL.md → ${skillPath}`)
      return skillPath
    } catch (e) {
      logger.error('skill-builder', `failed to write skill: ${e}`)
      throw e
    }
  }

  private sanitizeName(name: string): string {
    // Replace non-alphanumeric with underscores, keep Chinese chars
    return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').substring(0, 64)
  }
}
