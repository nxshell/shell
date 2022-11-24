const os = require('os');
let pty = null;
try {
    pty = require('node-pty');
}catch(e) {
    console.log('node pty load failed', e);
}
const shell = (() => {
    let platform = os.platform();
    if (platform === 'win32') {
        return 'powershell.exe';
    } else if (platform === 'darwin') {
        return 'zsh';
    } else {
        return 'bash';
    }
})();

const { NXTERMINAL_EVENTS, NxTerminal } = require("../../common/nxsys/terminal");
const { PROTOCOLS, PROTOCOL_CAPS_MAP } = require("../../common/nxsys/consts");
const { register } = require("./registry");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { NxNodeServer } = require("./node");

class LocalShellTerminal extends NxTerminal {
    /**
     * @type {NxNodeServer}
     */
    parent = null;
    shellStrem = null;
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
            this.shellStrem = conn;
            conn.on("exit", () => {
                this.emit(NXTERMINAL_EVENTS.CLOSE);
            });
            conn.on("data", (data) => {
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
            throw new Error('LocalShell terminal conn id not exist');
        }
    }

    async bindDataChannel(channelId) {
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
        if (this.shellStrem) {
            this.shellStrem.write(data);
        }
    }
    async setWindowSize(cols, rows) {
        this.shellStrem.resize(cols, rows);
    }

    async openTunnel() {
        throw new Error("Telnet no support tunnel");
    }

    async close() {
        if (this.shellStrem) {
            this.shellStrem = null;
            this.parent.closeConnection(this.connId);
        }
    }

    async dispose() {
        await this.close();
        this.shellStrem = null;
        this.emit("dispose");
        this.removeAllListeners();
    }
}


class LocalShellNodes extends NxNodeServer {
    caps = PROTOCOL_CAPS_MAP.LOCALSHELL

    initialized = null;
    openedHandlers = [];
    fsHandlers = [];

    constructor(uuid, connProtocol, sessionConfig) {
        super(uuid, connProtocol, sessionConfig);
    }

    async _createConnection() {
        const ptyProcess = pty.spawn(shell, [], {
            cols: 150,
            rows: 50,
            cwd: os.homedir(),
            env: process.env
          });
        return ptyProcess;
    }

    /**
     * 关闭SSH连接
     * @param {Client}} conn SSH连接实例
     */
    _closeConnection(conn) {
        conn.kill();
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
            throw new Error("LocalShell session no support duplicate")
        }
        return connId;
    }

    async getTerminalInstance(reuseConnId=-1) {
        reuseConnId = -1;
        let connId = await this._prepareConnection(reuseConnId);
        const terminal = new LocalShellTerminal(this, connId);
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

register(PROTOCOLS.LOCALSHELL, LocalShellNodes);
