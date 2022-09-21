const { NxNode } = require("../../../common/nxsys/nodes");
import { NxTerminalClient } from "./terminal";
import { SFTPFileSystem } from "../filesystem/sftp";
import { FTPFileSystem } from "../filesystem/ftp";

class NxNodeClient extends NxNode {
    constructor(handler, sessionUUID, connProtocol, sessionConfig) {
        super(sessionUUID, connProtocol, sessionConfig);
        this.service = powertools.getService();
        this.handler = handler;
    }

    async init() {
        await this.service.callObject(this.handler, "init");
    }

    async updateConfig(newConfig) {
        await this.service.callObject(this.handler, "updateConfig", newConfig);
    }

    async getTerminalInstance(reuseConnId=-1, control_ch) {
        const termHandler = await this.service.callObject(this.handler, "getTerminalInstance", reuseConnId, control_ch);
        return new NxTerminalClient(termHandler);
    }

    async getFSInstance(reuseConnId=-1, control_ch) {
        const fsHandler = await this.service.callObject(this.handler, "getFSInstance", reuseConnId, control_ch);
        let fsIns = null;
        switch(this.protocol) {
            case 'FTP':
                fsIns =  new FTPFileSystem(fsHandler);
                break;
            case 'SFTP':
            default:
                fsIns = new SFTPFileSystem(fsHandler);
                break;
        }
        return fsIns;
    }
    async getNetInstance(reuseConnId=-1) {}
    async getGUIInstance(reuseConnId=-1) {}
    async getUserInstance(reuseConnId=-1) {}

    dispose() {
        this.service.callObject(this.handler, "dispose");
    }
}

const nodeClients = Object.create(null);
const nodeClientsSessions = Object.create(null);

function createNodeClient(handler, sessionUUID, protocal, sessionConfig) {
    if (handler in nodeClients) {
        return nodeClients[handler];
    }

    const node = new NxNodeClient(handler, sessionUUID, protocal, sessionConfig);

    nodeClients[handler] = node;
    nodeClientsSessions[sessionUUID] = node;

    return node;
}

/**
 * 创建一个节点会话实例代理，指向服务的会话实例
 * 
 * @param {String} sessionUUID 会话配置的UUID
 * @param {Object} sessionConfig 会话的配置
 * @returns {Promise.<Object.<Proxy>>}
 */
export async function createNodeSessionInstance(sessionUUID, sessionConfig) {
    const service = powertools.getService();
    
    const handler = await service.createNodeSessionInstance(sessionUUID, sessionConfig);

    return createNodeClient(handler, sessionUUID, sessionConfig.protocal, sessionConfig);
}

export async function getNodeSessionInstanceByUUID(sessionUUID) {
    const client = nodeClientsSessions[sessionUUID];

    if (!client) {
        throw new Error("no instance");
    }

    return client;
}