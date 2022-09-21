import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";
import {createNodeSessionInstance} from "./nxsys/nodes";
import { NxTerminalClient } from "./nxsys/terminal";


const WaitObject = require("../../common/utils/waitObject");

/**
 * Shell会话
 * @extends {SessionInterface}
 */
class SerialPortSession extends SessionInterface {
    /**
     * Shell会话构造函数
     * @constructor
     * @param {Object} params Shell参数
     * @param {String} params.name 会话名称
     * @param {String} params.uuid 会话对应的UUID
     * @param {String} params.host 会话主机
     * @param {Number} params.port 会话端口
     * @param {String} [params.username] 用户名称，可选
     * @param {String} [params.password] 用户密码，可选
     * @param {String} [params.auth="password"] 认证方法
     */
    constructor(params) {
        super(params.name, SESSION_TYPES.SHELL);
        this.cfg = params;
        this.connId = params.connId;
    }

    async init() {
        this.emit("data", "Connect to server ...\r\n\n");
        
        this.clientReady = new WaitObject();
        this.resize_window = async (cols, rows) => {
            await this.clientReady.wait();
            await this.terminal.setWindowSize(cols, rows);
        };
        this.on("resize", this.resize_window);

        let nodeInstance;
        try {
            nodeInstance = await createNodeSessionInstance(this.cfg.uuid, this.cfg);
            await nodeInstance.init();
        } catch (err) {
            console.error(err);
            this.emit("data", 'Connect to server failed! \r\n');
            this.emit("error", "Connect fail");
            return;
        }
        this.nodeInstance = nodeInstance;

        const service = powertools.getService();
        const channel = service.createChannel();

        channel.on("ready", () => {
            console.log("channel ready");
        });

        channel.on("data", (data) => {
            this.emit("data", data);
        });

        try {
            /**
             * @type {NxTerminalClient}
             */
            let connId = -1;
            if(this.connId >= 0) {
                connId = this.connId;
            }
            this.terminal = await this.nodeInstance.getTerminalInstance(connId);
            await this.terminal.init(this.cfg.xterm);
            this.clientReady.resolve();
        } catch (err) {
            // notify to frontend
            let msg = err.toString();
            this.emit('data', new Buffer.from(msg));
            this.terminal = null;
            return;
        }

        this.send_data = async (data) => {
            await this.terminal.sendData(data);
        };
        this.on('send_data', this.send_data);

        this.terminal.bindDataChannel(channel.channelId);        
    }

    async openTunnel() {
        return await this.terminal.openTunnel();
    }

    async getTermConnId() {
        return await this.terminal.getConnId();
    }

    _close_terminal() {
        this.terminal.dispose();
        this.terminal = null;
        this.clientReady = null;
        this.off("send_data", this.send_data);
        this.off("resize", this.resize_window);
    }

    close() {
        if(this.terminal) {
            this._close_terminal();
        }
        // this.emit("close");
        super.close();
    }

    async duplicate() {
        let session = new ShellSession(this.cfg);
        session.init();
        return session;
    }

    async refresh() {
        if(this.terminal) {
            this._close_terminal();
        }
        await this.init();
    }
}

async function createSerialPortSession(params) {
    let session =  new SerialPortSession(params);
    session.init();
    return session;
}

registerSessionFactory(SESSION_TYPES.SERIALPORT, createSerialPortSession);

