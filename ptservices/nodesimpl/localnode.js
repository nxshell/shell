const { NxNode } = require("../../common/nxsys/nodes");
const { PROTOCOLS, PROTOCOL_CAPS_MAP } = require("../../common/nxsys/consts");
const { register } = require("./registry");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { NxNodeServer } = require("./node");

const { LOCALFileSystem } = require("../fs/localfs");


class LOCALNodes extends NxNodeServer {
    caps = PROTOCOL_CAPS_MAP.LOCAL

    initialized = null;

    sshSession = null;

    openedHandlers = [];
    fsHandlers = [];

    constructor(uuid, connProtocol, sessionConfig) {
        super(uuid, connProtocol, sessionConfig);
    }

    async _createConnection() {
    }

    /**
     * 关闭连接
     * @param {Client}} conn SSH连接实例
     */
    _closeConnection(conn) {
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

    }

    async getFSInstance(reuseConnId=-1) {
        const fs = new LOCALFileSystem(this);
        const handler = createObjectHandle(fs);

        this.openedHandlers.push(handler);

        fs.once("dispose", () => {
            this._removeOpenedHandler(handler);
        })

        return handler;
    }
    async getNetInstance(reuseConnId=-1) {}
    async getGUIInstance(reuseConnId=-1) {}
    async getUserInstance(reuseConnId=-1) {}

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

register(PROTOCOLS.LOCAL, LOCALNodes);
