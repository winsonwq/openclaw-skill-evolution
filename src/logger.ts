import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { LogLevel } from './types'

const LOG_DIR = path.join(os.homedir(), '.openclaw', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'skill-evolution.log')
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ROTATED = 3

const levelPriority: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

class Logger {
  private level: LogLevel = 'INFO'
  private logStream: fs.WriteStream | null = null

  setLevel(level: LogLevel): void {
    this.level = level
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.level]
  }

  private getStream(): fs.WriteStream {
    if (!this.logStream) {
      // ensure dir exists
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true })
      }
      this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' })
    }
    return this.logStream
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stat = await fs.promises.stat(LOG_FILE).catch(() => null)
      if (!stat || stat.size < MAX_SIZE) return

      // Rotate: .3 → .4 (delete), .2 → .3, .1 → .2, current → .1
      const rotate = (from: string, to: string): Promise<void> => {
        return fs.promises.rename(from, to).catch(() => {
          // ignore if doesn't exist
        })
      }

      const base = LOG_FILE
      await rotate(`${base}.${MAX_ROTATED - 1}`, `${base}.${MAX_ROTATED}`).catch(() => {})
      for (let i = MAX_ROTATED - 2; i >= 0; i--) {
        const from = i === 0 ? base : `${base}.${i}`
        const to = `${base}.${i + 1}`
        await rotate(from, to).catch(() => {})
      }
    } catch {
      // rotation errors are non-fatal
    }
  }

  private format(level: LogLevel, module: string, msg: string): string {
    const ts = new Date().toISOString()
    return `[${ts}] [${level.padEnd(5)}] [${module.padEnd(14)}] ${msg}`
  }

  private async write(level: LogLevel, module: string, msg: string, data?: object): Promise<void> {
    if (!this.shouldLog(level)) return

    const line = data
      ? `${this.format(level, module, msg)} ${JSON.stringify(data)}`
      : this.format(level, module, msg)

    await this.rotateIfNeeded()

    const stream = this.getStream()
    stream.write(line + os.EOL)

    if (level === 'DEBUG') {
      console.debug(line)
    } else if (level === 'ERROR') {
      console.error(line)
    } else if (level === 'WARN') {
      console.warn(line)
    } else {
      console.log(line)
    }
  }

  debug(module: string, msg: string, data?: object): void {
    this.write('DEBUG', module, msg, data)
  }

  info(module: string, msg: string, data?: object): void {
    this.write('INFO', module, msg, data)
  }

  warn(module: string, msg: string, data?: object): void {
    this.write('WARN', module, msg, data)
  }

  error(module: string, msg: string, data?: object): void {
    this.write('ERROR', module, msg, data)
  }

  async flush(): Promise<void> {
    if (this.logStream) {
      await new Promise<void>((resolve) => {
        this.logStream!.end(resolve)
        this.logStream = null
      })
    }
  }
}

export const logger = new Logger()
