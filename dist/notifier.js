"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifier = void 0;
const logger_1 = require("./logger");
class Notifier {
    constructor(enabled) {
        this.enabled = enabled;
    }
    notifyNewSkill(event, skillName, skillPath) {
        if (!this.enabled)
            return;
        const msg = `🔄 Skill 学会了！

新学会了：${skillName}
文件：${skillPath}
请重启 Gateway 以加载新 skill。`;
        event.messages.push(msg);
        logger_1.logger.info('notifier', `notification queued for session`);
    }
    notifySkillExists(event, skillName) {
        if (!this.enabled)
            return;
        const msg = `⚠️ Skill "${skillName}" 已存在，无需重复生成。`;
        event.messages.push(msg);
        logger_1.logger.warn('notifier', `skill "${skillName}" already exists, skipped`);
    }
}
exports.Notifier = Notifier;
//# sourceMappingURL=notifier.js.map