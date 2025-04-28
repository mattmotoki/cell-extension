/**
 * logger.ts - Logging Utility for Cell Collection Game
 * 
 * This file provides a logging utility with configurable verbosity levels
 * to control the amount of information displayed in the console.
 * 
 * Key features:
 * - Multiple log levels (ERROR, WARN, INFO, DEBUG, TRACE)
 * - Runtime configurable verbosity
 * - Module-specific logging with prefixes
 * - Timestamp support
 * 
 * Relationships:
 * - Used throughout the application to replace direct console.log calls
 * - Independent utility with no dependencies on other components
 * 
 * Revision Log:
 * - Initial implementation
 * - Fixed browser compatibility issue with process.env
 * - Converted to TypeScript
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

// Define log levels with numeric values for comparison
export enum LogLevel {
    NONE = 0,   // No logging
    ERROR = 1,  // Only errors
    WARN = 2,   // Errors and warnings
    INFO = 3,   // Errors, warnings, and important info
    DEBUG = 4,  // Detailed information (default for most existing logs)
    TRACE = 5   // Verbose tracing information
}

// Determine if we're in production mode
// Safely check for environment without relying on process.env
const isProduction = (function() {
    try {
        // Check if we're in a browser environment with window
        if (typeof window !== 'undefined') {
            // In browser, check for production build indicators
            // This can be customized based on your build process
            return window.location.hostname !== 'localhost' && 
                !window.location.hostname.includes('127.0.0.1');
        }
        
        // If process exists (Node.js environment), use NODE_ENV
        if (typeof process !== 'undefined' && process.env) {
            return process.env.NODE_ENV === 'production';
        }
        
        // Default to non-production if can't determine
        return false;
    } catch (e) {
        // In case of any errors, default to non-production for more verbose logging
        console.warn('Error determining environment, defaulting to development mode for logging');
        return false;
    }
})();

// Current log level, defaulting to INFO in production, DEBUG in development
let currentLogLevel: LogLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG;

// Include timestamps in logs (default: true)
let includeTimestamp: boolean = true;

/**
 * Set the global log level
 * @param {LogLevel} level - The log level to set
 */
export function setLogLevel(level: LogLevel): void {
    if (Object.values(LogLevel).includes(level)) {
        currentLogLevel = level;
        info('Logger', `Log level set to ${getLogLevelName(level)}`);
    } else {
        warn('Logger', `Invalid log level: ${level}. Using ${getLogLevelName(currentLogLevel)}`);
    }
}

/**
 * Get the current log level
 * @returns {LogLevel} The current log level
 */
export function getLogLevel(): LogLevel {
    return currentLogLevel;
}

/**
 * Get the name of a log level
 * @param {LogLevel} level - The log level
 * @returns {string} The name of the log level
 */
export function getLogLevelName(level: LogLevel): string {
    return LogLevel[level] || 'UNKNOWN';
}

/**
 * Set whether to include timestamps in logs
 * @param {boolean} include - Whether to include timestamps
 */
export function setIncludeTimestamp(include: boolean): void {
    includeTimestamp = include;
}

/**
 * Format a log message with optional module name and timestamp
 * @param {string} level - The log level name
 * @param {string} module - The module name
 * @param {Array} args - The log message arguments
 * @returns {Array} Formatted log arguments
 */
function formatLogArgs(level: string, module: string, args: any[]): any[] {
    const prefix: string[] = [];
    
    // Add timestamp if enabled
    if (includeTimestamp) {
        const now = new Date();
        const timestamp = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        prefix.push(`[${timestamp}]`);
    }
    
    // Add level
    prefix.push(`[${level}]`);
    
    // Add module if provided
    if (module) {
        prefix.push(`[${module}]`);
    }
    
    // Combine prefix with original arguments
    return [prefix.join(' '), ...args];
}

/**
 * Log an error message
 * @param {string} module - The module name
 * @param {...any} args - The log message arguments
 */
export function error(module: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.ERROR) {
        console.error(...formatLogArgs('ERROR', module, args));
    }
}

/**
 * Log a warning message
 * @param {string} module - The module name
 * @param {...any} args - The log message arguments
 */
export function warn(module: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.WARN) {
        console.warn(...formatLogArgs('WARN', module, args));
    }
}

/**
 * Log an info message
 * @param {string} module - The module name
 * @param {...any} args - The log message arguments
 */
export function info(module: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.INFO) {
        console.info(...formatLogArgs('INFO', module, args));
    }
}

/**
 * Log a debug message
 * @param {string} module - The module name
 * @param {...any} args - The log message arguments
 */
export function debug(module: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
        console.log(...formatLogArgs('DEBUG', module, args));
    }
}

/**
 * Log a trace message
 * @param {string} module - The module name
 * @param {...any} args - The log message arguments
 */
export function trace(module: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.TRACE) {
        console.log(...formatLogArgs('TRACE', module, args));
    }
}

/**
 * Logger interface for module-specific logging
 */
export interface Logger {
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    trace: (...args: any[]) => void;
}

/**
 * Shorthand for creating a logger with a specific module name
 * @param {string} module - The module name
 * @returns {Object} An object with logging methods
 */
export function createLogger(module: string): Logger {
    return {
        error: (...args: any[]) => error(module, ...args),
        warn: (...args: any[]) => warn(module, ...args),
        info: (...args: any[]) => info(module, ...args),
        debug: (...args: any[]) => debug(module, ...args),
        trace: (...args: any[]) => trace(module, ...args),
    };
}

// Export a default logger
export default {
    setLogLevel,
    getLogLevel,
    getLogLevelName,
    setIncludeTimestamp,
    error,
    warn,
    info,
    debug,
    trace,
    createLogger,
    LogLevel
}; 