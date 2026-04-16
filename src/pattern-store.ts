import * as fs from 'fs'
import * as path from 'path'
import { Registry, PatternEntry } from './types'
import { logger } from './logger'

export class PatternStore {
  private registry: Registry
  private storePath: string

  constructor(patternsDir: string) {
    this.storePath = path.join(patternsDir, 'registry.json')
    this.registry = this.load()
  }

  private load(): Registry {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf-8')
        const parsed = JSON.parse(raw) as Registry
        logger.info('pattern-store', `loaded ${Object.keys(parsed.patterns).length} patterns from registry`)
        return parsed
      }
    } catch (e) {
      logger.warn('pattern-store', `failed to load registry, starting fresh: ${e}`)
    }
    return { version: 1, patterns: {} }
  }

  private async save(): Promise<void> {
    try {
      const dir = path.dirname(this.storePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      await fs.promises.writeFile(this.storePath, JSON.stringify(this.registry, null, 2), 'utf-8')
      logger.debug('pattern-store', `registry.json written (${Object.keys(this.registry.patterns).length} patterns tracked)`)
    } catch (e) {
      logger.error('pattern-store', `failed to write registry: ${e}`)
    }
  }

  getPattern(toolName: string): PatternEntry | undefined {
    return this.registry.patterns[toolName]
  }

  getAllPatterns(): Record<string, PatternEntry> {
    return this.registry.patterns
  }

  async increment(toolName: string, toolSequence: string[], skillPath: string): Promise<number> {
    const existing = this.registry.patterns[toolName]
    if (existing) {
      existing.success_count += 1
      existing.last_seen = new Date().toISOString()
      existing.tool_sequence = toolSequence
    } else {
      this.registry.patterns[toolName] = {
        tool_name: toolName,
        tool_sequence: toolSequence,
        success_count: 1,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        skill_path: skillPath,
      }
    }
    await this.save()
    return this.registry.patterns[toolName].success_count
  }

  hasSkillFile(toolName: string): boolean {
    const entry = this.registry.patterns[toolName]
    if (!entry) return false
    try {
      return fs.existsSync(entry.skill_path)
    } catch {
      return false
    }
  }

  async reset(): Promise<void> {
    this.registry = { version: 1, patterns: {} }
    await this.save()
    logger.info('pattern-store', 'registry reset')
  }
}
