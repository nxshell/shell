const net = require('net');
const { Telnet } = require('./telnet');
const { NXTERMINAL_EVENTS, NxTerminal } = require("../../common/nxsys/terminal");
const { PROTOCOLS, PROTOCOL_CAPS_MAP } = require("../../common/nxsys/consts");
const { register } = require("./registry");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { NxNodeServer } = require("./node");
const { resolve } = require('path');

class TelnetTerminal extends NxTerminal {
    /**
     * @type {NxNodeServer}
     */
    parent = null;
    telnetStrem = null;
    connId = -1;
    wait_bind_msg_queue = [];

    constructor(parent, connId) {
        super();
        this.parent = parent;
        this.connId = connId;
    }

    async init() {
        let conn = this.parent.refConnection(this.connId);
        let telnetStream = conn;

        return await new Promise((resolve, reject) => {
            this.telnetStrem = telnetStream;
            telnetStream.on("close", () => {
                this.emit(NXTERMINAL_EVENTS.CLOSE);
            });
            telnetStream.on("data", (data) => {
                this._write_channel(data);
            });
            this._write_channel(new Buffer.from('Connected'));
            resolve(true);
        });
    }

    _write_channel(data) {
        if(this.channel) {
            this.channel.send(data);
        } else {
            this.wait_bind_msg_queue.push(data);
        }
    }

    async getConnId() {
        if(this.connId !== -1) {
            return this.connId;
        } else {
            throw new Error('telnet terminal conn id not exist');
        }
    }

    async bindDataChannel(channelId) {
        //this.channel = powertools.bindChannelByPeerId(channelId);
        this.channel = powertools.bindHsIPCChannelById(channelId);
        this.channel.on('data', (d)=>{
            this.sendData(d);
        })
        if(this.wait_bind_msg_queue.length) {
            this.wait_bind_msg_queue.forEach((ele) => {
                this.channel.send(ele);
            })
        }
        this.wait_bind_msg_queue = [];
    }

    async sendData(data) {
        if (this.telnetStrem) {
            this.telnetStrem.write(data);
        }
    }
    async setWindowSize(cols, rows) {
        if (this.telnetStrem) {
            this.telnetStrem.resize(cols, rows);
        }
    }

    async openTunnel() {
        throw new Error("Telnet no support tunnel");
    }

    async close() {
        if (this.telnetStrem) {
            this.telnetStrem = null;
            this.parent.closeConnection(this.connId);
        }
    }

    async dispose() {
        await this.close();
        this.telnetStrem = null;
        this.emit("dispose");
        this.removeAllListeners();
    }
}


class TelnetNodes extends NxNodeServer {
    caps = PROTOCOL_CAPS_MAP.TELNET

    initialized = null;
    telnetConnect = null;
    openedHandlers = [];
    fsHandlers = [];

    constructor(uuid, connProtocol, sessionConfig) {
        super(uuid, connProtocol, sessionConfig);
    }

    async _createConnection() {
        const host = this.config.hostAddress;
        const port = this.config.hostTelnetPort || 23;
        const connection = new Telnet(host, port);

        await connection.connect();
        this.telnetConnect = connection;
        return connection;
    }

    /**
     * 关闭SSH连接
     * @param {Client}} conn SSH连接实例
     */
    _closeConnection(conn) {
        conn.end();
    }

    async init() {
    }

    _removeOpenedHandler(handler) {
        const idx = this.openedHandlers.findIndex(val => val === handler);
        if (idx > -1) {
            this.openedHandlers.splice(idx, 1);
        }
    }

    async _prepareConnection(reuseConnId) {
        let connId = reuseConnId;
        if (reuseConnId === -1) {
            connId = await this.createConnection();
        } else {
            throw new Error("Telnet session no support duplicate")
        }
        return connId;
    }

    async getTerminalInstance(reuseConnId=-1) {
        reuseConnId = -1;
        let connId = await this._prepareConnection(reuseConnId);
        const terminal = new TelnetTerminal(this, connId);
        const handler = createObjectHandle(terminal);

        this.openedHandlers.push(handler);

        terminal.once("dispose", () => {
            this._removeOpenedHandler(handler);
        });

        return handler;
    }

    async getFSInstance(reuseConnId=-1) {

    }
    async getNetInstance(reuseConnId=-1) {}
    async getGUIInstance(reuseConnId=-1) {}
    async getUserInstance(reuseConnId=-1) {}

    getPathLib() {
        return super.getPathLib().posix;
    }

    dispose() {
        if (this.openedHandlers.length) {
            for (let i = 0 ; i < this.openedHandlers.length; i++) {
                const handleId = this.openedHandlers[i];
                closeObject(handleId);
            }
        }

        this.emit("dispose");
        this.removeAllListeners();
    }
}

register(PROTOCOLS.TELNET, TelnetNodes);
