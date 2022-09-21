const { NxNode } = require("../../common/nxsys/nodes");
const { NXTERMINAL_EVENTS, NxTerminal } = require("../../common/nxsys/terminal");
const { PROTOCOLS, PROTOCOL_CAPS_MAP } = require("../../common/nxsys/consts");
const { register } = require("./registry");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { NxNodeServer } = require("./node");

let SerialPort = null;
try {
    SerialPort = require('serialport');
}catch(e) {
    console.warn('serialport import failed ', e);
}

class SerialPortTerminal extends NxTerminal {
    /**
     * @type {NxNodeServer}
     */
    parent = null;
    serialStream = null;
    connId = -1;
    wait_bind_msg_queue = [];

    constructor(parent, connId) {
        super();
        this.parent = parent;
        this.connId = connId;
    }

    async init() {
        let conn = this.parent.refConnection(this.connId);
        
        return await new Promise((resolve, reject) => {
            this.serialStream = conn;
            conn.on("close", () => {
                this.emit(NXTERMINAL_EVENTS.CLOSE);
            });
            conn.on("data", (data) => {
                // this.emit(NXTERMINAL_EVENTS.DATA, data);
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
            throw new Error('serial terminal conn id not exist');
        }
    }

    async bindDataChannel(channelId) {
        this.channel = powertools.bindChannelByPeerId(channelId);
        if(this.wait_bind_msg_queue.length) {
            this.wait_bind_msg_queue.forEach((ele) => {
                this.channel.send(ele);
            })
        }
        this.wait_bind_msg_queue = [];
    }

    async sendData(data) {
        if (this.serialStream) {
            this.serialStream.write(data);
        }
    }
    async setWindowSize(cols, rows) {
        
    }

    async openTunnel() {
        
    }

    async close() {
        if (this.serialStream) {
            this.serialStream = null;
            this.parent.closeConnection(this.connId);
        }
    }

    async dispose() {
        await this.close();
        this.serialStream = null;
        this.emit("dispose");
        this.removeAllListeners();
    }
}


class SerialPortNodes extends NxNodeServer {
    caps = PROTOCOL_CAPS_MAP.SERIALPORT

    initialized = null;

    serialPortSession = null;

    openedHandlers = [];
    fsHandlers = [];

    constructor(uuid, connProtocol, sessionConfig) {
        super(uuid, connProtocol, sessionConfig);
    }

    async _createConnection() {
        let open_options = {
            autoOpen: false,
            baudRate: this.config.baudRate,
            dataBits: this.config.dataBits,
            stopBits: this.config.stopBits,
            parity: this.config.parity,
        }
        if(this.config.flowControl === 'rtscts') {
            open_options.rtscts = true;
        } else if(this.config.flowControl === 'xon/xoff') {
            open_options.xon = true;
            open_options.xoff = true;
        } else {
            open_options.xany = true;
        }
        const serial_port = new SerialPort(this.config.port, open_options);
        this.serialPortSession = serial_port;
        return  new Promise((resolve, reject) => {
            serial_port.open((e) => {
                if(e) {
                    reject(e);
                } else {
                    resolve(serial_port);
                }
            })
        });
    }

    /**
     * 关闭SSH连接
     * @param {Client}} conn SSH连接实例
     */
    _closeConnection(conn) {
        conn.close();
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
        }
        return connId;
    }

    async getTerminalInstance(reuseConnId=-1) {
        let connId = await this._prepareConnection(reuseConnId);

        const terminal = new SerialPortTerminal(this, connId);
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

        this.serialPortSession.close();

        this.emit("dispose");
        this.removeAllListeners();
    }
}

register(PROTOCOLS.SERIALPORT, SerialPortNodes);

async function getSerialPorts() {
    let ports = [];
    try {
        ports = await SerialPort.list();
    } catch(e) {
        console.log('get serial prots error ', e);
    }
    ports = ports.map((e)=> {
        return {
            path: e.path
        }
    })
    return ports;

}

module.exports = {
    getSerialPorts
};
