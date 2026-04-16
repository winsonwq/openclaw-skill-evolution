"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Counter = void 0;
const logger_1 = require("./logger");
// Indicators that a tool call succeeded
const SUCCESS_INDICATORS = [
    '✅', 'success', 'SUCCESS',
    'error":false', 'error": false',
    'exit code 0', 'exit_code: 0',
    '"status": "success"', '"status":"success"',
];
// Indicators that a tool call failed
const FAILURE_INDICATORS = [
    '❌', 'error', 'ERROR',
    'error":true', 'error": true',
    'exit code 1', 'exit_code: 1',
    '"status": "error"', '"status":"error"',
];
class Counter {
    constructor() {
        this.sequence = [];
    }
    addTool(name) {
        this.sequence.push(name);
        // keep last 10
        if (this.sequence.length > 10) {
            this.sequence = this.sequence.slice(-10);
        }
    }
    getSequence() {
        return [...this.sequence];
    }
    /**
     * Determine if a tool result indicates success.
     * Checks for explicit success markers first, then failure markers.
     */
    isSuccess(result) {
        if (result.is_error)
            return false;
        const content = result.content.toLowerCase();
        for (const indicator of SUCCESS_INDICATORS) {
            if (content.includes(indicator.toLowerCase())) {
                return true;
            }
        }
        for (const indicator of FAILURE_INDICATORS) {
            if (content.includes(indicator.toLowerCase())) {
                return false;
            }
        }
        // If content is short and doesn't contain obvious failure, optimistically assume success
        // (many tools just return text without explicit markers)
        return result.content.length < 5000;
    }
    /**
     * Parse tool_calls and results from the bodyForAgent text.
     * bodyForAgent is a structured text that contains tool call blocks.
     */
    parseToolCalls(bodyForAgent) {
        const tool_calls = [];
        const results = [];
        // Try to find tool call blocks in the text
        // Format: [TOOL_CALL] name: xxx, arguments: {...} [/TOOL_CALL]
        // or similar patterns
        const toolCallRegex = /\[TOOL_CALL\]\s*name:\s*(\w+)[^\[]*arguments:\s*(\{[^}]+\}|[^\[]+)\s*\[\/TOOL_CALL\]/gi;
        const resultRegex = /\[TOOL_RESULT\]\s*id:\s*([^\s]+)[^\[]*content:\s*([^\[]+)\s*\[\/TOOL_RESULT\]/gi;
        let match;
        while ((match = toolCallRegex.exec(bodyForAgent)) !== null) {
            tool_calls.push({
                name: match[1],
                arguments: match[2].trim(),
                id: '',
            });
        }
        while ((match = resultRegex.exec(bodyForAgent)) !== null) {
            results.push({
                tool_call_id: match[1],
                content: match[2].trim(),
                is_error: false,
            });
        }
        logger_1.logger.debug('counter', `parsed ${tool_calls.length} tool_calls, ${results.length} results from bodyForAgent`);
        return { tool_calls, results };
    }
}
exports.Counter = Counter;
//# sourceMappingURL=counter.js.map