import * as os from 'os'
import { logger } from './logger'
import { loadConfig } from './config'
import { PatternStore } from './pattern-store'
import { Counter } from './counter'
import { SkillBuilder } from './skill-builder'
import { Notifier, NotifyEvent } from './notifier'

// Module-level singleton state (persists across events)
let store: PatternStore | null = null
let counter: Counter | null = null
let builder: SkillBuilder | null = null
let notifier: Notifier | null = null
let initialized = false

function getHookDir(): string {
  // HOOK.md is in the hook's root directory
  // OpenClaw loads hooks from ~/.openclaw/hooks/<name>/
  const homedir = os.homedir()
  return `${homedir}/.openclaw/hooks/openclaw-skill-evolution`
}

function init(): void {
  if (initialized) return

  const hookDir = getHookDir()
  const config = loadConfig(hookDir)

  if (!config.enabled) {
    logger.info('handler', 'skill-evolution disabled in config')
    return
  }

  store = new PatternStore(config.patterns_dir)
  counter = new Counter()
  builder = new SkillBuilder(config.skill_dir)
  notifier = new Notifier(config.notify_on_update)

  initialized = true
  logger.info('handler', `initialized (threshold=${config.threshold}, skill_dir=${config.skill_dir})`)
}

interface HookEvent {
  type: string
  action?: string
  sessionKey?: string
  timestamp?: string
  messages?: string[]
  context?: {
    bodyForAgent?: string
    bootstrapFiles?: string[]
    compactedCount?: number
    [key: string]: any
  }
  [key: string]: any
}

async function handleEvent(event: HookEvent): Promise<void> {
  init()

  if (!initialized) return

  // Gateway startup: log ready
  if (event.type === 'gateway:startup') {
    logger.info('handler', 'gateway started, skill-evolution hook active')
    return
  }

  // message:preprocessed: parse tool calls and count
  if (event.type === 'message:preprocessed' && event.context?.bodyForAgent) {
    const body = event.context.bodyForAgent

    if (!counter || !store || !builder || !notifier) return

    const { tool_calls, results } = counter.parseToolCalls(body)

    if (tool_calls.length === 0) {
      logger.debug('handler', 'no tool calls found in this message')
      return
    }

    // Get config for threshold and exclude_patterns
    const config = loadConfig(getHookDir())
    const exclude = config.exclude_patterns || []

    for (const tc of tool_calls) {
      if (exclude.includes(tc.name)) {
        logger.debug('handler', `tool "${tc.name}" in exclude list, skipping`)
        continue
      }

      counter.addTool(tc.name)

      // Find matching result for this tool call
      const result = results.find((r) => r.tool_call_id === tc.id) || results[0]
      if (!result) continue

      const success = counter.isSuccess(result)
      logger.debug('handler', `tool "${tc.name}" result: success=${success}`, {
        content: result.content.substring(0, 100),
      })

      if (success) {
        const skillPath = `${config.skill_dir}/${tc.name}/SKILL.md`
        const count = await store.increment(tc.name, counter.getSequence(), skillPath)
        logger.info('handler', `pattern "${tc.name}" count: ${count}/${config.threshold}`)

        if (count === config.threshold) {
          logger.info('handler', `pattern "${tc.name}" reached threshold!`)

          const msgEvent = { messages: event.messages || [] }
          if (store.hasSkillFile(tc.name)) {
            notifier.notifySkillExists(msgEvent, tc.name)
          } else {
            try {
              await builder.build(store.getPattern(tc.name)!)
              notifier.notifyNewSkill(msgEvent, tc.name, skillPath)
            } catch (e) {
              logger.error('handler', `failed to build skill: ${e}`)
            }
          }
        }
      }
    }
  }

  // session:compact:after: might have lost patterns, just log
  if (event.type === 'session:compact:after') {
    logger.info('handler', `session compacted, ${event.context?.compactedCount || 0} messages compacted`)
  }
}

// Export the handler for OpenClaw
export default async function (event: HookEvent): Promise<void> {
  try {
    await handleEvent(event)
  } catch (e) {
    logger.error('handler', `unhandled error: ${e}`)
  }
}
