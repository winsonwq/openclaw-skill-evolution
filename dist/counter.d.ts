import { ParsedToolCalls, ToolResult } from './types';
export declare class Counter {
    private sequence;
    addTool(name: string): void;
    getSequence(): string[];
    /**
     * Determine if a tool result indicates success.
     * Checks for explicit success markers first, then failure markers.
     */
    isSuccess(result: ToolResult): boolean;
    /**
     * Parse tool_calls and results from the bodyForAgent text.
     * bodyForAgent is a structured text that contains tool call blocks.
     */
    parseToolCalls(bodyForAgent: string): ParsedToolCalls;
}
//# sourceMappingURL=counter.d.ts.map