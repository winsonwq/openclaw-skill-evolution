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
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const skill_builder_1 = require("./skill-builder");
describe('SkillBuilder', () => {
    let tmpDir;
    let builder;
    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-builder-test-'));
        builder = new skill_builder_1.SkillBuilder(tmpDir);
    });
    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    describe('build', () => {
        it('writes a valid SKILL.md file', async () => {
            const pattern = {
                tool_name: 'gh',
                tool_sequence: ['gh pr view', 'gh pr merge'],
                success_count: 3,
                first_seen: '2026-04-16T10:00:00Z',
                last_seen: '2026-04-16T10:10:00Z',
                skill_path: path.join(tmpDir, 'gh', 'SKILL.md'),
            };
            const skillPath = await builder.build(pattern);
            expect(fs.existsSync(skillPath)).toBe(true);
            const content = fs.readFileSync(skillPath, 'utf-8');
            expect(content.includes('---')).toBe(true);
            expect(content.includes('name: "gh"')).toBe(true);
            expect(content.includes('auto_learned: true')).toBe(true);
            expect(content.includes('gh pr view')).toBe(true);
        });
        it('escapes quotes in name', async () => {
            const pattern = {
                tool_name: 'my-tool',
                tool_sequence: ['my-tool --flag'],
                success_count: 3,
                first_seen: '2026-04-16T10:00:00Z',
                last_seen: '2026-04-16T10:10:00Z',
                skill_path: path.join(tmpDir, 'my-tool', 'SKILL.md'),
            };
            await builder.build(pattern);
            const content = fs.readFileSync(pattern.skill_path, 'utf-8');
            expect(content).toContain('name: "my-tool"');
        });
    });
});
//# sourceMappingURL=skill-builder.test.js.map