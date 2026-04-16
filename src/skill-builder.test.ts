import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { SkillBuilder } from './skill-builder'
import { PatternEntry } from './types'

describe('SkillBuilder', () => {
  let tmpDir: string
  let builder: SkillBuilder

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-builder-test-'))
    builder = new SkillBuilder(tmpDir)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('build', () => {
    it('writes a valid SKILL.md file', async () => {
      const pattern: PatternEntry = {
        tool_name: 'gh',
        tool_sequence: ['gh pr view', 'gh pr merge'],
        success_count: 3,
        first_seen: '2026-04-16T10:00:00Z',
        last_seen: '2026-04-16T10:10:00Z',
        skill_path: path.join(tmpDir, 'gh', 'SKILL.md'),
      }

      const skillPath = await builder.build(pattern)

      expect(fs.existsSync(skillPath)).toBe(true)
      const content = fs.readFileSync(skillPath, 'utf-8')
      expect(content.includes('---')).toBe(true)
      expect(content.includes('name: "gh"')).toBe(true)
      expect(content.includes('auto_learned: true')).toBe(true)
      expect(content.includes('gh pr view')).toBe(true)
    })

    it('escapes quotes in name', async () => {
      const pattern: PatternEntry = {
        tool_name: 'my-tool',
        tool_sequence: ['my-tool --flag'],
        success_count: 3,
        first_seen: '2026-04-16T10:00:00Z',
        last_seen: '2026-04-16T10:10:00Z',
        skill_path: path.join(tmpDir, 'my-tool', 'SKILL.md'),
      }

      await builder.build(pattern)
      const content = fs.readFileSync(pattern.skill_path, 'utf-8')
      expect(content).toContain('name: "my-tool"')
    })
  })
})
