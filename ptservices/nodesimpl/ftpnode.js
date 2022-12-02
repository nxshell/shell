const { PROTOCOLS, PROTOCOL_CAPS_MAP } = require("../../common/nxsys/consts");
const { register } = require("./registry");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { NxNodeServer } = require("./node");

const Client = require('nxshell-ftp');

const { FTPFileSystem } = require("../fs/ftp");

class FTPNodes extends NxNodeServer {
    caps = PROTOCOL_CAPS_MAP.SSH2

    initialized = null;

    sshSession = null;

    openedHandlers = [];
    fsHandlers = [];

    constructor(uuid, connProtocol, sessionConfig) {
        super(uuid, connProtocol, sessionConfig);
    }

    updateConfig(cfg) {
        let secure = cfg.secure;
        try{
            secure = JSON.parse(cfg.secure);
        }catch(e){
        }
        this.config = {
            host: cfg.hostAddress,
            port: cfg.hostFtpPort,
            protocal: 'ftp',
            username: cfg.username,
            password: cfg.password,
            secure: secure
        };
    }

    async _createConnection() {
        const sessConfig = this.config;
        const authConfig = {
            password: sessConfig.password,
            user: sessConfig.username,
            host: sessConfig.host.trim(),
            port: sessConfig.port,
            secure: sessConfig.secure, //support: true, control, default to false
            secureOptions: {"rejectUnauthorized":false} //https://github.com/icetee/remote-ftp/issues/57
        };
        const ftp_client = new Client();
        return new Promise((resolve, reject) => {
            ftp_client.on('ready', ()=>{
                resolve(ftp_client);
            })
            ftp_client.on('error', (err)=>{
                reject(err);
            })

            ftp_client.connect(authConfig);
        })
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
        }
        return connId;
    }

    async getTerminalInstance(reuseConnId=-1) {

    }

    async getFSInstance(reuseConnId=-1) {
        const connId = await this._prepareConnection(reuseConnId);

        const fs = new FTPFileSystem(this, connId);
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

        this.sshSession.end();

        this.emit("dispose");
        this.removeAllListeners();
    }
}

register(PROTOCOLS.FTP, FTPNodes);
