const { EventEmitter } = require("events");

const NXTERMINAL_EVENTS = {
    DATA: "data",
    CLOSE: "close",
    ERROR: "error"
}

class NxTerminal extends EventEmitter {
    async init(termOps) {}
    async bindDataChannel(channelId) {}
    async getConnection() {}
    async sendData(data) {}
    async setWindowSize(cols, rows) {}
    async getWindowSize() {}
    async close() {}
    async dispose() {}
}

module.exports = {
    NXTERMINAL_EVENTS,

    NxTerminal
};
