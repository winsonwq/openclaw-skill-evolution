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
exports.PatternStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
class PatternStore {
    constructor(patternsDir) {
        this.storePath = path.join(patternsDir, 'registry.json');
        this.registry = this.load();
    }
    load() {
        try {
            if (fs.existsSync(this.storePath)) {
                const raw = fs.readFileSync(this.storePath, 'utf-8');
                const parsed = JSON.parse(raw);
                logger_1.logger.info('pattern-store', `loaded ${Object.keys(parsed.patterns).length} patterns from registry`);
                return parsed;
            }
        }
        catch (e) {
            logger_1.logger.warn('pattern-store', `failed to load registry, starting fresh: ${e}`);
        }
        return { version: 1, patterns: {} };
    }
    async save() {
        try {
            const dir = path.dirname(this.storePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await fs.promises.writeFile(this.storePath, JSON.stringify(this.registry, null, 2), 'utf-8');
            logger_1.logger.debug('pattern-store', `registry.json written (${Object.keys(this.registry.patterns).length} patterns tracked)`);
        }
        catch (e) {
            logger_1.logger.error('pattern-store', `failed to write registry: ${e}`);
        }
    }
    getPattern(toolName) {
        return this.registry.patterns[toolName];
    }
    getAllPatterns() {
        return this.registry.patterns;
    }
    async increment(toolName, toolSequence, skillPath) {
        const existing = this.registry.patterns[toolName];
        if (existing) {
            existing.success_count += 1;
            existing.last_seen = new Date().toISOString();
            existing.tool_sequence = toolSequence;
        }
        else {
            this.registry.patterns[toolName] = {
                tool_name: toolName,
                tool_sequence: toolSequence,
                success_count: 1,
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                skill_path: skillPath,
            };
        }
        await this.save();
        return this.registry.patterns[toolName].success_count;
    }
    hasSkillFile(toolName) {
        const entry = this.registry.patterns[toolName];
        if (!entry)
            return false;
        try {
            return fs.existsSync(entry.skill_path);
        }
        catch {
            return false;
        }
    }
    async reset() {
        this.registry = { version: 1, patterns: {} };
        await this.save();
        logger_1.logger.info('pattern-store', 'registry reset');
    }
}
exports.PatternStore = PatternStore;
//# sourceMappingURL=pattern-store.js.map