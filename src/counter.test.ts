import { Counter } from './counter'
import { ToolResult } from './types'

describe('Counter', () => {
  let counter: Counter

  beforeEach(() => {
    counter = new Counter()
  })

  describe('addTool', () => {
    it('adds tool name to sequence', () => {
      counter.addTool('gh')
      expect(counter.getSequence()).toEqual(['gh'])
    })

    it('keeps last 10 tools', () => {
      for (let i = 0; i < 15; i++) {
        counter.addTool(`tool${i}`)
      }
      const seq = counter.getSequence()
      expect(seq.length).toBe(10)
      expect(seq[0]).toBe('tool5')
      expect(seq[9]).toBe('tool14')
    })
  })

  describe('isSuccess', () => {
    const success = (content: string): ToolResult => ({ tool_call_id: 'x', content, is_error: false })
    const fail = (content: string): ToolResult => ({ tool_call_id: 'x', content, is_error: true })

    it('recognizes ✅ as success', () => {
      expect(counter.isSuccess(success('✅ PR merged'))).toBe(true)
    })

    it('recognizes exit code 0 as success', () => {
      expect(counter.isSuccess(success('exit code 0'))).toBe(true)
    })

    it('recognizes error markers as failure', () => {
      expect(counter.isSuccess(fail('❌ Something went wrong'))).toBe(false)
    })

    it('recognizes error":true as failure', () => {
      expect(counter.isSuccess(success('"error":true,"message":"bad"'))).toBe(false)
    })

    it('assumes short content without failure markers is success', () => {
      expect(counter.isSuccess(success('Here is your output'))).toBe(true)
    })

    it('rejects long content without clear success markers', () => {
      const long = 'x'.repeat(6000)
      expect(counter.isSuccess(success(long))).toBe(false)
    })
  })

  describe('parseToolCalls', () => {
    it('parses tool call blocks', () => {
      const body = `[TOOL_CALL] name: gh, arguments: {"pr":"123"} [/TOOL_CALL]`
      const { tool_calls } = counter.parseToolCalls(body)
      expect(tool_calls.length).toBe(1)
      expect(tool_calls[0].name).toBe('gh')
    })

    it('returns empty on no tool calls', () => {
      const { tool_calls, results } = counter.parseToolCalls('just some text')
      expect(tool_calls.length).toBe(0)
      expect(results.length).toBe(0)
    })
  })
})
