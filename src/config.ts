import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Config } from './types'
import { logger } from './logger'

const CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'configs', 'skill-evolution.json')

const DEFAULT_CONFIG: Config = {
  enabled: true,
  threshold: 3,
  skill_dir: path.join(os.homedir(), '.openclaw', 'workspace', 'skills'),
  patterns_dir: '',  // set dynamically
  log_level: 'INFO',
  notify_on_update: true,
  exclude_patterns: [],
}

let cachedConfig: Config = null as any

export function loadConfig(hookDir: string): Config {
  if (cachedConfig) return cachedConfig

  const defaults = { ...DEFAULT_CONFIG, patterns_dir: path.join(hookDir, 'patterns') }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
      const user = JSON.parse(raw)
      cachedConfig = { ...defaults, ...user }
    } else {
      cachedConfig = defaults
    }
  } catch (e) {
    logger.warn('config', `failed to load config, using defaults: ${e}`)
    cachedConfig = defaults
  }

  logger.info('config', `loaded config`, cachedConfig)
  return cachedConfig
}

export function resetConfigCache(): void {
  ;(cachedConfig as any) = null
}
