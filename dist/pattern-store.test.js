"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const pattern_store_1 = require("./pattern-store");
describe('PatternStore', () => {
    let tmpDir;
    let store;
    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-evolution-test-'));
        store = new pattern_store_1.PatternStore(tmpDir);
    });
    afterEach(() => {
        // cleanup
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    describe('load', () => {
        it('starts with empty registry on first run', () => {
            expect(store.getAllPatterns()).toEqual({});
        });
        it('loads existing registry', async () => {
            await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            const store2 = new pattern_store_1.PatternStore(tmpDir);
            expect(store2.getPattern('gh')).toBeDefined();
            expect(store2.getPattern('gh').success_count).toBe(1);
        });
    });
    describe('increment', () => {
        it('creates new pattern on first increment', async () => {
            const count = await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            expect(count).toBe(1);
            expect(store.getPattern('gh').tool_name).toBe('gh');
        });
        it('increments existing pattern', async () => {
            await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            const count = await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            expect(count).toBe(3);
        });
        it('updates tool_sequence on increment', async () => {
            await store.increment('gh', ['gh pr view'], '/tmp/skills/gh/SKILL.md');
            await store.increment('gh', ['gh pr merge'], '/tmp/skills/gh/SKILL.md');
            const seq = store.getPattern('gh').tool_sequence;
            expect(seq).toContain('gh pr merge');
        });
    });
    describe('hasSkillFile', () => {
        it('returns false when no pattern exists', () => {
            expect(store.hasSkillFile('gh')).toBe(false);
        });
        it('returns false when pattern exists but no skill file', () => {
            store.increment('gh', ['gh'], '/nonexistent/path/SKILL.md');
            expect(store.hasSkillFile('gh')).toBe(false);
        });
        it('returns true when skill file exists', () => {
            const skillPath = path.join(tmpDir, 'skills', 'gh', 'SKKILL.md');
            fs.mkdirSync(path.dirname(skillPath), { recursive: true });
            fs.writeFileSync(skillPath, 'test');
            store.increment('gh', ['gh'], skillPath);
            expect(store.hasSkillFile('gh')).toBe(true);
        });
    });
    describe('reset', () => {
        it('clears all patterns', async () => {
            await store.increment('gh', ['gh'], '/tmp/gh.md');
            await store.increment('git', ['git'], '/tmp/git.md');
            await store.reset();
            expect(store.getAllPatterns()).toEqual({});
        });
    });
});
//# sourceMappingURL=pattern-store.test.js.map