const path = require("path");

const { NODES_CAPS, PROTOCOL_CAPS_MAP } = require("./consts");
const { EventEmitter } = require("events");

class NxNode extends EventEmitter {
    caps = 0;
    uuid = "";
    protocol = "";
    config = null;

    constructor(uuid, connProtocol, config) {
        super();
        this.uuid = uuid;
        const protocol = connProtocol.toUpperCase();
        if (!(protocol in PROTOCOL_CAPS_MAP)) {
            throw new Error("unsupported protocol type: " + connProtocol);
        }
        this.protocol = protocol;
        this.caps = PROTOCOL_CAPS_MAP[protocol];
        this.config = config;
    }

    async init() {
        throw new Error("Unimplemented!");
    }

    updateConfig(newConfig) {
        //console.log("UPDATECONFIG:", newConfig);
        this.config = newConfig;
    }

    /**
     * 该节点是否存在Terminal
     * @returns {Boolean}
     */
    hasTerminal() {
        return this.caps & NODES_CAPS.TERMINAL !== 0;
    }

    /**
     * 该节点是支持GUI（X11，RDP，VNC）
     * @returns {Boolean}
     */
    hasGUI() {
        return this.caps & NODES_CAPS.GUI !== 0;
    }

    /**
     * 该节点是否支持文件系统
     * @returns {Boolean}
     */
    hasFS() {
        return this.caps & NODES_CAPS.FS !== 0;
    }

    /**
     * 该节点是否存在网络特性
     * @returns {Boolean}
     */
    hasNet() {
        return this.caps & NODES_CAPS.NET !== 0;
    }

    /**
     * 该节点是否可以读取系统用户信息
     * @returns {Boolean}
     */
    hasUser() {
        return this.caps & NODES_CAPS.USERS !== 0;
    }

    /**
     * 获取节点支持主要功能
     * @returns {Number}
     */
    getPrimaryCap() {
        if (this.hasTerminal()) {
            return NODES_CAPS.TERMINAL;
        } else if (this.hasGUI()) {
            return NODES_CAPS.GUI;
        } else if (this.hasFS()) {
            return NODES_CAPS.FS;
        } else if (this.hasNet()) {
            return NODES_CAPS.NET;
        } else if (this.hasUser()) {
            return NODES_CAPS.USERS;
        }
    }

    async getTerminalInstance(reuseConnId=-1) {}
    async getFSInstance(reuseConnId=-1) {}
    async getNetInstance(reuseConnId=-1) {}
    async getGUIInstance(reuseConnId=-1) {}
    async getUserInstance(reuseConnId=-1) {}

    getPathLib() {
        return path;
    }

    dispose() {}
}

module.exports = {
    NxNode
}
