import { PatternEntry } from './types';
export declare class PatternStore {
    private registry;
    private storePath;
    constructor(patternsDir: string);
    private load;
    private save;
    getPattern(toolName: string): PatternEntry | undefined;
    getAllPatterns(): Record<string, PatternEntry>;
    increment(toolName: string, toolSequence: string[], skillPath: string): Promise<number>;
    hasSkillFile(toolName: string): boolean;
    reset(): Promise<void>;
}
//# sourceMappingURL=pattern-store.d.ts.map