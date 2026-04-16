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
exports.logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const LOG_DIR = path.join(os.homedir(), '.openclaw', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'skill-evolution.log');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROTATED = 3;
const levelPriority = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};
class Logger {
    constructor() {
        this.level = 'INFO';
        this.logStream = null;
    }
    setLevel(level) {
        this.level = level;
    }
    shouldLog(level) {
        return levelPriority[level] >= levelPriority[this.level];
    }
    getStream() {
        if (!this.logStream) {
            // ensure dir exists
            if (!fs.existsSync(LOG_DIR)) {
                fs.mkdirSync(LOG_DIR, { recursive: true });
            }
            this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
        }
        return this.logStream;
    }
    async rotateIfNeeded() {
        try {
            const stat = await fs.promises.stat(LOG_FILE).catch(() => null);
            if (!stat || stat.size < MAX_SIZE)
                return;
            // Rotate: .3 → .4 (delete), .2 → .3, .1 → .2, current → .1
            const rotate = (from, to) => {
                return fs.promises.rename(from, to).catch(() => {
                    // ignore if doesn't exist
                });
            };
            const base = LOG_FILE;
            await rotate(`${base}.${MAX_ROTATED - 1}`, `${base}.${MAX_ROTATED}`).catch(() => { });
            for (let i = MAX_ROTATED - 2; i >= 0; i--) {
                const from = i === 0 ? base : `${base}.${i}`;
                const to = `${base}.${i + 1}`;
                await rotate(from, to).catch(() => { });
            }
        }
        catch {
            // rotation errors are non-fatal
        }
    }
    format(level, module, msg) {
        const ts = new Date().toISOString();
        return `[${ts}] [${level.padEnd(5)}] [${module.padEnd(14)}] ${msg}`;
    }
    async write(level, module, msg, data) {
        if (!this.shouldLog(level))
            return;
        const line = data
            ? `${this.format(level, module, msg)} ${JSON.stringify(data)}`
            : this.format(level, module, msg);
        await this.rotateIfNeeded();
        const stream = this.getStream();
        stream.write(line + os.EOL);
        if (level === 'DEBUG') {
            console.debug(line);
        }
        else if (level === 'ERROR') {
            console.error(line);
        }
        else if (level === 'WARN') {
            console.warn(line);
        }
        else {
            console.log(line);
        }
    }
    debug(module, msg, data) {
        this.write('DEBUG', module, msg, data);
    }
    info(module, msg, data) {
        this.write('INFO', module, msg, data);
    }
    warn(module, msg, data) {
        this.write('WARN', module, msg, data);
    }
    error(module, msg, data) {
        this.write('ERROR', module, msg, data);
    }
    async flush() {
        if (this.logStream) {
            await new Promise((resolve) => {
                this.logStream.end(resolve);
                this.logStream = null;
            });
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map