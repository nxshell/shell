import { EventEmitter } from "events";
import { isPromise } from "../../common/utils"

import * as EventBus from "./eventbus";

export const SESSION_TYPES = {
    WELCOME: "welcome",
    SETTING: "setting",
    SHELL: "shell",
    SERIALPORT: "serialport",
    SFTP: "sftp",
    FTP: "ftp",
    TELNET: 'telnet',
    LOCALSHELL: 'localshell',
    VNC: 'vnc',
    WEBDAV: 'webdav',
    LOGIN: "login",
    EDITOR: "editor",
    GLOBALSETTING: "globalsetting"
};

const sessionFactory = {};

class SessionFactory {
    type = "shell";
    factory = () => null;
    constructor (type, factory) {
        this.type = type;
        this.factory = factory;
    }

    /**
     * 创建一个实例
     * @param {Object} param 创建实例的参数
     * @param {String} param.name 实例名称
     * @return {Promise.<SessionInterface>}
     */
    async createInstance(param) {
        let ret = this.factory(param);

        let instance = ret;
        if (isPromise(ret)) {
            instance = await ret;
        }
        return instance;
    }
}

/**
 * 根据会话类型获取会话Factory
 * 
 * @param {String} type 会话类型
 * @return {Promise.<SessionFactory>}
 */
export function getSessionFactory(type) {
    return sessionFactory[type.toUpperCase()] || null;
}

export function registerSessionFactory(type, factory) {
    console.info("register session factory:", type);
    if (typeof type !== "string") {
        return;
    }

    type = type.toUpperCase();
    if (!type in SESSION_TYPES) {
        throw new Error("invalid session type");
    }
    sessionFactory[type] = new SessionFactory(type, factory);
}

export class SessionInterface extends EventEmitter {
    name = "";
    id = "";
    type="";
    /**
     * 此会话实例引用的会话实例
     * @type {SessionInterface}
     */
    ref = null;
    /**
     * 此会话实例被引用的会话实例
     * @type {SessionInterface[]}
     */
    refBySessions = [];
    constructor(name, type) {
        super();
        this.name = name;
        this.type = type;
        this.closeCallBack = null;
    }

    get router() {
        return {
            path: `/${this.type}/${this.id}`
        }
    }

    updateName(newName) {
        this.name = newName;
    }

    /**
     * 引用一个会话实例
     * 
     * @param {SessionInterface} session 引用的会话实例
     */
    ref(session) {
        if (!session instanceof SessionInterface) {
            return;
        }
        this.ref = session;
        session.refBy(this);
    }

    /**
     * 添加到被引用列表
     * 
     * @param {SessionInterface} bySession 此会话被bySession引用
     */
    refBy(bySession) {
        this.refBySessions.push(bySession);
    }

    /**
     * 解除被引用
     * @param {SessionInterface} bySession 解除被bySession引用的状态
     */
    unRefBy(bySession) {
        if (!(bySession instanceof SessionInterface)) {
            return;
        }

        let index = this.refBySessions.findIndex((val) => {
            return val._id = bySession._id;
        });
        if (index > -1) {
            this.refBySessions.splice(index, 1);
        }
        // 已经没有其他会话引用自己了，所以可以释放所有资源，安心的离去了
        if (this.refBySessions.length === 0) {
            this.dispose();
        }
    }

    unref() {
        if (this.ref) {
            this.ref.unRefBy(this);
            this.ref = null;
        }
    }

    setId(instanceId) {
        this.id = instanceId;
    }

    getId() {
        return this.id;
    }
    
    /**
     * 关闭当前会话
     */
    close() {
        this.emit("close");
        EventBus.publish("instance-close", this);
    }

    _call_close_callback() {
        if(this.closeCallBack) {
            this.closeCallBack();
        }
    }

    beforeClose() {
        this._call_close_callback();
    }

    registerCloseCallback(fn) {
        this.closeCallBack = fn;
    }

    /**
     * 复制会话
     * @return {any}
     */
    duplicate() {}

    /**
     * 销毁会话
     * 因为会话很有可能会在duplicate时，被复制的会话引用
     * 所以当所有引用被解除时才是销毁会话的时机
     */
    dispose() {
        // 清除所有监听者
        this.removeAllListeners();
    }
}
