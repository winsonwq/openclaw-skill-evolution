export interface NotifyEvent {
    messages: string[];
}
export declare class Notifier {
    private enabled;
    constructor(enabled: boolean);
    notifyNewSkill(event: NotifyEvent, skillName: string, skillPath: string): void;
    notifySkillExists(event: NotifyEvent, skillName: string): void;
}
//# sourceMappingURL=notifier.d.ts.map