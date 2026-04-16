interface HookEvent {
    type: string;
    action?: string;
    sessionKey?: string;
    timestamp?: string;
    messages?: string[];
    context?: {
        bodyForAgent?: string;
        bootstrapFiles?: string[];
        compactedCount?: number;
        [key: string]: any;
    };
    [key: string]: any;
}
export default function (event: HookEvent): Promise<void>;
export {};
//# sourceMappingURL=handler.d.ts.map