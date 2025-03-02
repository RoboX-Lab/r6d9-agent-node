/**
 * @file Logger utility
 * @description Provides logging functionality throughout the application
 */

import consola from 'consola';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to display */
  level: LogLevel;
  /** Whether to include timestamps */
  timestamp: boolean;
  /** Whether to include log level */
  showLogLevel: boolean;
  /** Whether to log to file */
  logToFile: boolean;
  /** Path to log file */
  logFilePath?: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: process.env.LOG_LEVEL as LogLevel || LogLevel.INFO,
  timestamp: true,
  showLogLevel: true,
  logToFile: false,
};

/**
 * Create a configured instance of consola logger
 */
const createLogger = (config: Partial<LoggerConfig> = {}) => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  return consola.create({
    level: mergedConfig.level === LogLevel.DEBUG ? 5 : 
           mergedConfig.level === LogLevel.INFO ? 4 :
           mergedConfig.level === LogLevel.SUCCESS ? 3 :
           mergedConfig.level === LogLevel.WARN ? 2 :
           mergedConfig.level === LogLevel.ERROR ? 1 : 0,
    reporters: [
      {
        log: (logObj) => {
          const { type, args } = logObj;
          
          // Format the message
          let message = '';
          
          if (mergedConfig.timestamp) {
            message += `[${new Date().toISOString()}] `;
          }
          
          if (mergedConfig.showLogLevel) {
            message += `[${type.toUpperCase()}] `;
          }
          
          // Add the actual log message
          message += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
          ).join(' ');
          
          // Output to console
          if (type === LogLevel.ERROR || type === LogLevel.FATAL) {
            console.error(message);
          } else if (type === LogLevel.WARN) {
            console.warn(message);
          } else {
            console.log(message);
          }
          
          // Log to file if configured
          if (mergedConfig.logToFile && mergedConfig.logFilePath) {
            // In a real implementation, we would write to file here
            // For now, we'll just simulate this behavior
          }
        }
      }
    ]
  });
};

/**
 * Application logger instance
 */
export const logger = createLogger();

/**
 * Create a context-specific logger
 * @param context - The logging context (e.g., module name)
 * @returns A logger that includes the context in all messages
 */
export function createContextLogger(context: string) {
  return {
    debug: (message: string, ...args: any[]) => logger.debug(`[${context}] ${message}`, ...args),
    info: (message: string, ...args: any[]) => logger.info(`[${context}] ${message}`, ...args),
    success: (message: string, ...args: any[]) => logger.success(`[${context}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => logger.warn(`[${context}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => logger.error(`[${context}] ${message}`, ...args),
    fatal: (message: string, ...args: any[]) => logger.fatal(`[${context}] ${message}`, ...args),
  };
}
