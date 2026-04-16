import { LogLevel } from './types';
declare class Logger {
    private level;
    private logStream;
    setLevel(level: LogLevel): void;
    private shouldLog;
    private getStream;
    private rotateIfNeeded;
    private format;
    private write;
    debug(module: string, msg: string, data?: object): void;
    info(module: string, msg: string, data?: object): void;
    warn(module: string, msg: string, data?: object): void;
    error(module: string, msg: string, data?: object): void;
    flush(): Promise<void>;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map