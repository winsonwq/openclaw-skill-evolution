"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillBuilder = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
class SkillBuilder {
    constructor(skillDir) {
        this.skillDir = skillDir;
    }
    escapeFrontmatter(value) {
        // Escape special chars in frontmatter values
        return value.replace(/"/g, '\\"');
    }
    formatFrontmatter(fm) {
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
`;
    }
    async build(pattern) {
        const skillName = this.sanitizeName(pattern.tool_name);
        const fm = {
            name: skillName,
            description: `自动学会的工具模式：连续 ${pattern.success_count} 次成功执行 ${pattern.tool_name}`,
            trigger: `连续 ${pattern.success_count} 次成功执行 ${pattern.tool_name} 后自动学习`,
            auto_learned: true,
            learned_at: pattern.last_seen,
            source_pattern: pattern.tool_name,
            tool_sequence: pattern.tool_sequence,
        };
        const skillContent = this.formatFrontmatter(fm);
        const skillPath = path.join(this.skillDir, skillName, 'SKILL.md');
        try {
            const dir = path.dirname(skillPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await fs.promises.writeFile(skillPath, skillContent, 'utf-8');
            logger_1.logger.info('skill-builder', `wrote SKILL.md → ${skillPath}`);
            return skillPath;
        }
        catch (e) {
            logger_1.logger.error('skill-builder', `failed to write skill: ${e}`);
            throw e;
        }
    }
    sanitizeName(name) {
        // Replace non-alphanumeric with underscores, keep Chinese chars
        return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').substring(0, 64);
    }
}
exports.SkillBuilder = SkillBuilder;
//# sourceMappingURL=skill-builder.js.map