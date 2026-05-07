const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Console logging for real-time debugging
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level}: ${message}`;
                })
            )
        }),
        // Daily rotating file for permanent records
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/license-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

module.exports = logger;
