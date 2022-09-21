const { NxTerminal, NXTERMINAL_EVENTS } = require("../../../common/nxsys/terminal");

export class NxTerminalClient extends NxTerminal {
    cols = 0;
    rows = 0;
    constructor(handler) {
        super();
        this.service = powertools.getService();
        this.handler = handler;
    }

    async init(termOps) {
        return await this.service.callObject(this.handler, "init", termOps);
    }

    async bindDataChannel(channelId) {
        return await this.service.callObject(this.handler, "bindDataChannel", channelId);
    }

    async sendData(data) {
        return await this.service.callObject(this.handler, "sendData", data);
    }

    async setWindowSize(cols, rows) {
        await this.service.callObject(this.handler, "setWindowSize", cols, rows);
        this.cols = cols;
        this.rows = rows;
    }

    async openTunnel() {
        return await this.service.callObject(this.handler, "openTunnel");
    }

    async getConnId() {
        return await this.service.callObject(this.handler, "getConnId");
    }

    async getWindowSize() {
        const { cols, rows } = this;
        return {
            cols,
            rows
        };
    }

    async close() {
        await this.service.callObject(this.handler, "close");
    }

    async dispose() {
        await this.service.callObject(this.handler, "dispose");
        this.emit("dispose");
        this.service = null;
        this.handler = null;
        this.removeAllListeners();
    }
};
