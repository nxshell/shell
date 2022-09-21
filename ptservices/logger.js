const { NxLogger } = require("../common/nxsys/logger");
const { createObjectHandle } = require("./nxobjs");

const winston = require('winston');
const { printf } = winston.format;

const rawFormat = printf(({ level, message, label, timestamp }) => {
    return message;
});

class NxLoggerServer extends NxLogger {
    
    constructor(logFile) {
        super(logFile);
        this._create_logger();
    }

    _create_logger() {
        const logger = winston.createLogger({
            format: rawFormat,
            transports: [
              new winston.transports.File({ filename: this.file}),
            ],
            exitOnError: false,
          });
        this.logger = logger;          
    }

    info(s) {
        this.logger.info(s);
    }
}

function createLogger(file) {
    const logger = new NxLoggerServer(file);

    const handler = createObjectHandle(logger);

    return handler;
}

module.exports = {
    createLogger
};
