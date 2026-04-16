import { logger } from './logger'

export interface NotifyEvent {
  messages: string[]
}

export class Notifier {
  constructor(private enabled: boolean) {}

  notifyNewSkill(event: NotifyEvent, skillName: string, skillPath: string): void {
    if (!this.enabled) return

    const msg = `🔄 Skill 学会了！

新学会了：${skillName}
文件：${skillPath}
请重启 Gateway 以加载新 skill。`

    event.messages.push(msg)
    logger.info('notifier', `notification queued for session`)
  }

  notifySkillExists(event: NotifyEvent, skillName: string): void {
    if (!this.enabled) return

    const msg = `⚠️ Skill "${skillName}" 已存在，无需重复生成。`

    event.messages.push(msg)
    logger.warn('notifier', `skill "${skillName}" already exists, skipped`)
  }
}
