import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { PatternStore } from './pattern-store'

describe('PatternStore', () => {
  let tmpDir: string
  let store: PatternStore

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-evolution-test-'))
    store = new PatternStore(tmpDir)
  })

  afterEach(() => {
    // cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('load', () => {
    it('starts with empty registry on first run', () => {
      expect(store.getAllPatterns()).toEqual({})
    })

    it('loads existing registry', async () => {
      await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      const store2 = new PatternStore(tmpDir)
      expect(store2.getPattern('gh')).toBeDefined()
      expect(store2.getPattern('gh')!.success_count).toBe(1)
    })
  })

  describe('increment', () => {
    it('creates new pattern on first increment', async () => {
      const count = await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      expect(count).toBe(1)
      expect(store.getPattern('gh')!.tool_name).toBe('gh')
    })

    it('increments existing pattern', async () => {
      await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      const count = await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      expect(count).toBe(3)
    })

    it('updates tool_sequence on increment', async () => {
      await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md')
      await store.increment('gh', ['gh pr merge'], '/tmp/skills/gh/SKILL.md')
      const seq = store.getPattern('gh')!.tool_sequence
      expect(seq).toContain('gh pr merge')
    })
  })

  describe('hasSkillFile', () => {
    it('returns false when no pattern exists', () => {
      expect(store.hasSkillFile('gh')).toBe(false)
    })

    it('returns false when pattern exists but no skill file', () => {
      store.increment('gh', ['gh'], '/nonexistent/path/SKILL.md')
      expect(store.hasSkillFile('gh')).toBe(false)
    })

    it('returns true when skill file exists', () => {
      const skillPath = path.join(tmpDir, 'skills', 'gh', 'SKKILL.md')
      fs.mkdirSync(path.dirname(skillPath), { recursive: true })
      fs.writeFileSync(skillPath, 'test')
      store.increment('gh', ['gh'], skillPath)
      expect(store.hasSkillFile('gh')).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears all patterns', async () => {
      await store.increment('gh', ['gh'], '/tmp/gh.md')
      await store.increment('git', ['git'], '/tmp/git.md')
      await store.reset()
      expect(store.getAllPatterns()).toEqual({})
    })
  })
})
