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
exports.default = default_1;
const os = __importStar(require("os"));
const logger_1 = require("./logger");
const config_1 = require("./config");
const pattern_store_1 = require("./pattern-store");
const counter_1 = require("./counter");
const skill_builder_1 = require("./skill-builder");
const notifier_1 = require("./notifier");
// Module-level singleton state (persists across events)
let store = null;
let counter = null;
let builder = null;
let notifier = null;
let initialized = false;
function getHookDir() {
    // HOOK.md is in the hook's root directory
    // OpenClaw loads hooks from ~/.openclaw/hooks/<name>/
    const homedir = os.homedir();
    return `${homedir}/.openclaw/hooks/openclaw-skill-evolution`;
}
function init() {
    if (initialized)
        return;
    const hookDir = getHookDir();
    const config = (0, config_1.loadConfig)(hookDir);
    if (!config.enabled) {
        logger_1.logger.info('handler', 'skill-evolution disabled in config');
        return;
    }
    store = new pattern_store_1.PatternStore(config.patterns_dir);
    counter = new counter_1.Counter();
    builder = new skill_builder_1.SkillBuilder(config.skill_dir);
    notifier = new notifier_1.Notifier(config.notify_on_update);
    initialized = true;
    logger_1.logger.info('handler', `initialized (threshold=${config.threshold}, skill_dir=${config.skill_dir})`);
}
async function handleEvent(event) {
    init();
    if (!initialized)
        return;
    // Gateway startup: log ready
    if (event.type === 'gateway:startup') {
        logger_1.logger.info('handler', 'gateway started, skill-evolution hook active');
        return;
    }
    // message:preprocessed: parse tool calls and count
    if (event.type === 'message:preprocessed' && event.context?.bodyForAgent) {
        const body = event.context.bodyForAgent;
        if (!counter || !store || !builder || !notifier)
            return;
        const { tool_calls, results } = counter.parseToolCalls(body);
        if (tool_calls.length === 0) {
            logger_1.logger.debug('handler', 'no tool calls found in this message');
            return;
        }
        // Get config for threshold and exclude_patterns
        const config = (0, config_1.loadConfig)(getHookDir());
        const exclude = config.exclude_patterns || [];
        for (const tc of tool_calls) {
            if (exclude.includes(tc.name)) {
                logger_1.logger.debug('handler', `tool "${tc.name}" in exclude list, skipping`);
                continue;
            }
            counter.addTool(tc.name);
            // Find matching result for this tool call
            const result = results.find((r) => r.tool_call_id === tc.id) || results[0];
            if (!result)
                continue;
            const success = counter.isSuccess(result);
            logger_1.logger.debug('handler', `tool "${tc.name}" result: success=${success}`, {
                content: result.content.substring(0, 100),
            });
            if (success) {
                const skillPath = `${config.skill_dir}/${tc.name}/SKILL.md`;
                const count = await store.increment(tc.name, counter.getSequence(), skillPath);
                logger_1.logger.info('handler', `pattern "${tc.name}" count: ${count}/${config.threshold}`);
                if (count === config.threshold) {
                    logger_1.logger.info('handler', `pattern "${tc.name}" reached threshold!`);
                    const msgEvent = { messages: event.messages || [] };
                    if (store.hasSkillFile(tc.name)) {
                        notifier.notifySkillExists(msgEvent, tc.name);
                    }
                    else {
                        try {
                            await builder.build(store.getPattern(tc.name));
                            notifier.notifyNewSkill(msgEvent, tc.name, skillPath);
                        }
                        catch (e) {
                            logger_1.logger.error('handler', `failed to build skill: ${e}`);
                        }
                    }
                }
            }
        }
    }
    // session:compact:after: might have lost patterns, just log
    if (event.type === 'session:compact:after') {
        logger_1.logger.info('handler', `session compacted, ${event.context?.compactedCount || 0} messages compacted`);
    }
}
// Export the handler for OpenClaw
async function default_1(event) {
    try {
        await handleEvent(event);
    }
    catch (e) {
        logger_1.logger.error('handler', `unhandled error: ${e}`);
    }
}
//# sourceMappingURL=handler.js.map