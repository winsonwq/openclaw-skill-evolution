// Types for skill-evolution hook

export interface Config {
  enabled: boolean
  threshold: number
  skill_dir: string
  patterns_dir: string
  log_level: LogLevel
  notify_on_update: boolean
  exclude_patterns: string[]
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface PatternEntry {
  tool_name: string
  tool_sequence: string[]
  success_count: number
  first_seen: string
  last_seen: string
  skill_path: string
}

export interface Registry {
  version: number
  patterns: Record<string, PatternEntry>
}

export interface ToolCall {
  name: string
  arguments: string
  id: string
}

export interface ToolResult {
  tool_call_id: string
  content: string
  is_error: boolean
}

export interface ParsedToolCalls {
  tool_calls: ToolCall[]
  results: ToolResult[]
}

export type SkillField = 'name' | 'description' | 'trigger' | 'auto_learned' | 'learned_at' | 'source_pattern'

export interface SkillFrontmatter {
  name: string
  description: string
  trigger: string
  auto_learned: boolean
  learned_at: string
  source_pattern: string
  tool_sequence: string[]
}
