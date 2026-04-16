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
exports.loadConfig = loadConfig;
exports.resetConfigCache = resetConfigCache;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = require("./logger");
const CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'configs', 'skill-evolution.json');
const DEFAULT_CONFIG = {
    enabled: true,
    threshold: 3,
    skill_dir: path.join(os.homedir(), '.openclaw', 'workspace', 'skills'),
    patterns_dir: '', // set dynamically
    log_level: 'INFO',
    notify_on_update: true,
    exclude_patterns: [],
};
let cachedConfig = null;
function loadConfig(hookDir) {
    if (cachedConfig)
        return cachedConfig;
    const defaults = { ...DEFAULT_CONFIG, patterns_dir: path.join(hookDir, 'patterns') };
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
            const user = JSON.parse(raw);
            cachedConfig = { ...defaults, ...user };
        }
        else {
            cachedConfig = defaults;
        }
    }
    catch (e) {
        logger_1.logger.warn('config', `failed to load config, using defaults: ${e}`);
        cachedConfig = defaults;
    }
    logger_1.logger.info('config', `loaded config`, cachedConfig);
    return cachedConfig;
}
function resetConfigCache() {
    ;
    cachedConfig = null;
}
//# sourceMappingURL=config.js.map