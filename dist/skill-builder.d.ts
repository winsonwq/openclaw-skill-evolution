import { PatternEntry } from './types';
export declare class SkillBuilder {
    private skillDir;
    constructor(skillDir: string);
    private escapeFrontmatter;
    private formatFrontmatter;
    build(pattern: PatternEntry): Promise<string>;
    private sanitizeName;
}
//# sourceMappingURL=skill-builder.d.ts.map