import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";
import {createNodeSessionInstance} from "./nxsys/nodes";
import { NxTerminalClient } from "./nxsys/terminal";


const WaitObject = require("../../common/utils/waitObject");

/**
 * Shell会话
 * @extends {SessionInterface}
 */
class ShellSession extends SessionInterface {
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
            this.current_cols_rows = {cols, rows};
            await this.clientReady.wait();
            await this.terminal.setWindowSize(cols, rows);
        };
        this.on("resize", this.resize_window);

        let nodeInstance;
        try {
            nodeInstance = await createNodeSessionInstance(this.cfg.uuid, this.cfg);
            await nodeInstance.init();
        } catch (err) {
            this.emit("data", 'Connect to server failed! \r\n');
            this.emit("error", "Connect fail");
            return;
        }

        const service = powertools.getService();
        const control = service.createChannel();

        const unix_file = await service.getHsIPCHandle();
        const channel = await powertools.createHsIPC(unix_file);

        this.control_channel = control;
        this.data_channel = channel;
        
        this.control_channel_cb = (data) => {
            if(data.type === 'error') {
                this.emit('error', data.message);
            } else {
                this.emit("control", data);
            }
        }
        this.data_channel_cb = (data)=> {
            this.emit("data", data);
        }

        this.control_channel.on('data', this.control_channel_cb)
        this.data_channel.on('data', this.data_channel_cb)

        this.send_data = async (data) => {
            await this.data_channel.send(data);
        };
        this.on('send_data', this.send_data);

        let terminal;
        try {
            /**
             * @type {NxTerminalClient}
             */
            let connId = -1;
            if(this.connId >= 0) {
                connId = this.connId;
            }
            terminal = await nodeInstance.getTerminalInstance(connId, control.channelId);
            await terminal.init(this.cfg.xterm);
            this.clientReady.resolve();
        } catch (err) {
            // notify to frontend
            let msg = err.toString();
            this.emit('data', new Buffer.from(msg));
            return;
        }
        this.terminal = terminal;

        this.terminal.bindDataChannel(channel.channelId);        
    }

    async sendControlData(data) {
        this.control_channel.send(data);
    }

    async openTunnel() {
        return await this.terminal.openTunnel();
    }

    async getTermConnId() {
        return await this.terminal.getConnId();
    }

    _close_terminal() {
        if(this.terminal) {
            this.terminal.dispose();
        }
        this.terminal = null;
        this.clientReady = null;
        this.off("send_data", this.send_data);
        this.off("resize", this.resize_window);
        this.control_channel.off("data", this.control_channel_cb);
        this.data_channel.off("data", this.data_channel_cb);
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
        if(this.refreshing) {
            return;
        }
        this.refreshing = true;
        try {
            this._close_terminal();
            await this.init();
            if(this.current_cols_rows) {
                let { cols, rows } = this.current_cols_rows;
                this.resize_window(cols, rows)
            }
        }catch(e) {
            // do nothing
        }
        this.refreshing = false;
    }
}

async function createShellSession(params) {
    let session =  new ShellSession(params);
    session.init();
    return session;
}

registerSessionFactory(SESSION_TYPES.SHELL, createShellSession);


class ShellSettingSession extends SessionInterface {
    constructor(sessionConfig) {
        super(sessionConfig.config.name || 'ShellSetting', SESSION_TYPES.SETTING)
        this.sessionCfg = sessionConfig;
        // FIXME: 实例销毁时需要将监听移除掉
        // this.sessionCfg.config.on("update", () => {
        //     this.name = this.sessionCfg.config.name;
        //     this.emit("update-name");
        // });
    }
    async getSerialPorts() {
        const service = powertools.getService();
        return await service.getSerialPorts();
    }
}

async function createShellSettingSession(sessionConfig) {
    return new ShellSettingSession(sessionConfig);
}

registerSessionFactory(SESSION_TYPES.SETTING, createShellSettingSession);
