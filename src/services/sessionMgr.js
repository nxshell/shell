/**
 * 会话管理器
 * 
 * 包括：会话配置管理和会话实例管理
 */
import { EventEmitter } from "events";
import { insert } from "../../common/utils";
import { IdGenerator } from "../../common/utils/idGenerator";
import WaitObject from "../../common/utils/waitObject";
import { getSessionFactory, SessionInterface, SESSION_TYPES } from "./session";

import {getNodeSessionInstanceByUUID} from "./nxsys/nodes";

import Storage from "./storage";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

import * as EventBus from "./eventbus";

import SessionRecent from "./sessionRecent";

export const SESSION_CONFIG_TYPE = {
    FOLDER: "folder",
    NODE: "node"
}

const sessConfigIdGenerator = new IdGenerator();
const sessInstanceIdGenerator = new IdGenerator();

/**
 * 会话配置
 */
export class SessionConfig extends EventEmitter {
    /**
     * 会话配置ID
     * 运行时属性，不做持久化处理
     * 根据ID和View层做关联处理
     */
    _id = 0

    /**
     * 父节点
     * @type {SessionConfig}
     */
    _parent = null
    
    /** 会话持久化UUID */
    uuid = ""
    /**
     * 会话名称
     * @property {SessionConfig}
     */
    name = ""
    config = {}
    description = ""
    type = "node"
    subSessions = []
    /**
     * @constructor {SessionConfig}
     * @param {String}  name 会话名称
     * @param {String}  [type] 会话类型，Folder或者Node，默认为Node
     * @param {Object}  [configParam] 会话配置参数
     * @param {String}  [configParam.sessType] 会话的类型
     * @param {String}  [description] 会话描述
     */
    constructor(name, type = SESSION_CONFIG_TYPE.NODE, configParam = null, description = "", uuid = "") {
        super();

        this._id = sessConfigIdGenerator.getNext();
        this.type = type;
        this.name = name;
        this.config = configParam;
        this.description = description;
        this.uuid = uuid || uuidv4();
    }

    /**
     * 添加会话配置到子会话列表中
     * 
     * @param {SessionConfig} sessionNode 会话节点
     * @param {Number} [index] 会话节点插入的位置：小于等于0，插入到子会话头部，如果没有指定或者大于子会话的个数，则插入到子会话的尾部
     */
    addSessionConfig(sessionNode, index) {
        if (this.type === SESSION_CONFIG_TYPE.NODE) {
            throw new Error("session node can not add sub-config");
        }
        if (!(sessionNode instanceof SessionConfig)) {
            throw new Error("SessionNode must be a instance of SessionConfig");
        }
        this.subSessions = insert(this.subSessions, sessionNode, index);
        sessionNode._parent = this;
        
        // this.emit("add-session", sessionNode);
        EventBus.publish("session-added", sessionNode);
    }

    update(name, configParam, description) {

        this.name = name;
        if (configParam) {
            this.config = configParam;
        }
        if (typeof description === "string") {
            this.description = description
        }
        
        getNodeSessionInstanceByUUID(this.uuid).then((instance) => {
            instance.updateConfig({
                name: this.name,
                uuid: this.uuid,
                ...this.config
            });
        }).catch((err) => {

        });

        // this.emit("update", this);
        EventBus.publish("session-update", this);
    }

    /**
     * 根据ID查找配置项
     * @param {Number} id 配置项ID
     */
    findSubSessionConfig(id) {
        const ret = {
            sessionConfig: null,
            index: -1
        }

        for (let i = 0; i < this.subSessions.length; i++) {
            /** @type {SessionConfig} */
            let sessionConfig = this.subSessions[i];
            if (sessionConfig._id == id) {
                ret.sessionConfig = sessionConfig;
                ret.index = i;
                break;
            }
        }

        return ret;
    }

    /**
     * 移除一个会话配置
     * 
     * 移除会话配置时，如果该会话配置下面存在子会话配置，则会被一同移除掉
     * 
     * @param {SessionConfig|Number} session 会话对象或者会话在子节点列表中的位置
     * @param {Boolean} [move] 是否为移动节点操作，默认是删除操作
     */
    removeSubSessionConfig(session, move = false) {
        let removeSession;
        if (typeof session === "number") {
            removeSession = this.subSessions.splice(session, 1);
        } else {
            // 无效的配置节点
            if (!(session instanceof SessionConfig)) {
                return;
            }
            let idx = this.subSessions.findIndex((val) => {
                return val._id == session._id;
            });

            removeSession = this.subSessions.splice(idx, 1);
        }
        if (move) {
            return
        }
        // this.emit("remove", removeSession[0]);
        // 递归删除
        /** @type {SessionConfig} */
        const curRemoveNode = removeSession[0];
        for (let i = curRemoveNode.subSessions.length - 1; i >= 0; i--) {
            let sessItem = curRemoveNode.subSessions[i];
            curRemoveNode.removeSubSessionConfig(sessItem);
        }
        // curRemoveNode.emit("remove", curRemoveNode);
        EventBus.publish("session-removed", curRemoveNode);
    }

    /**
     * 复制该会话配置对象，包括子节点
     */
    duplicate() {
        /**
         * 复制节点
         * @param {SessionConfig} parent 父节点
         */
        const duplicate = (parent) => {
            let config = new SessionConfig(
                parent.name,
                parent.type,
                parent.config ? _.cloneDeep(parent.config) : parent.config,
                parent.description
                /* TODO: add uuid */
            )

            parent.subSessions.forEach((subSession) => {
                let newSubSession = duplicate(subSession);
                config.addSessionConfig(newSubSession);
            })

            return config;
        }

        return duplicate(this);
    }

    /**
     * 转换节点为JSON对象（PlainObject）
     * 
     * @param {Boolean} [recursion] 是否递归，如果递归则遍历所有子会话节点
     * @param {Boolean} [id] 是否包含Id字段
     */
    toJSONObject(recursion = false, id = true) {
        let subSessions;

        if (this.type !== SESSION_CONFIG_TYPE.NODE && recursion) {
            subSessions = this.subSessions.map(sessionObj => sessionObj.toJSONObject(recursion, id));
        }

        const sessObj = {
            name: this.name,
            config: this.config,
            description: this.description,
            type: this.type,
            uuid: this.uuid
        };

        if (subSessions) {
            sessObj.subSessions = subSessions;
        }
        if (id) {
            sessObj._id = this._id;
        }
        return sessObj;
    }

    dispose() {
        this.removeAllListeners();
    }
}

class SessionManager extends EventEmitter {
    /**
     * @type {SessionConfig[]} 会话配置
     */
    sessionConfigs = [];
    sessionConfigsMapper = {};
    sessionConfigsUUIDMapper = {};
    /**
     * @type {SessionConfig} 会话配置树的根节点，根节点是个虚拟节点，主要是解决配置树的管理问题
     */
    sessionConfigsRoot = new SessionConfig("root", SESSION_CONFIG_TYPE.FOLDER)

    /**
     * @type {SessionInterface[]}
     */
    sessionInstances = [];
    sessionInstancesMapper = {};

    /** @type {{[propName: number]: WaitObject}} */
    sessionCreateJobs = {};

    /** @type {{[propName: number]: Set<number>}} */
    sessionConfigAssociated = Object.create(null);
    /** @type {{[propName: number]: number}} */
    sessionInstAssociated = Object.create(null);


    /**
     * @type {SessionInterface} 登录会话实例
     */
    loginSessionInstance = null;

    /**
     * @type {SessionRecent} 会话历史记录
     */
    sessionRecent = null;

    constructor() {
        super();
        
        this.sessionRecent = new SessionRecent();
        // TODO: add code here
        EventBus.subscript("session-update", (sessionConfig) => {
            this.handleSessionConfigUpdate(sessionConfig);
        });

        EventBus.subscript("session-removed", (sessionConfig) => {
            this.handleSessionConfigRemove(sessionConfig);
        });

        EventBus.subscript("instance-close", (inst) => {
            this.handleInstanceDestroy(inst.id);
        })
    }

    /**
     * 处理会话配置移除事件
     * @param {SessionConfig} sessCfgObj 会话配置对象
     */
    handleSessionConfigRemove(sessCfgObj) {
        // this.emit("session-remove", sessCfgObj);

        /* 清除历史记录 */
        this.sessionRecent.removeRecent(sessCfgObj.uuid);

        const sessionInstances = this.matchSessionInstanceByConfig(sessCfgObj) || [];
        sessionInstances.forEach((inst) => {
            inst.close();
        });

        /* 销毁自己 */
        sessCfgObj.dispose();
        this.saveSessionConfigs()
    }

    handleSessionConfigUpdate(sessCfgObj) {
        // this.emit("session-update", sessCfgObj);
        this.saveSessionConfigs();
    }

    async loadSessionConfigs() {
        let sessCfgObjects = null;
        try {
            sessCfgObjects = await Storage.read("SESSIONS");
        }catch(e) {
            //skip;
        }
        
        if (!sessCfgObjects) {
            return;
        }

        const handleSessionConfigRemove = (sessCfgObj) => {
            this.handleSessionConfigRemove(sessCfgObj);
        }

        const handleSessionConfigUpdate = (sessCfgObj) => {
            this.handleSessionConfigUpdate(sessCfgObj);
        }

        const processSessionConfigs = (configs) => {
            let configObjects = [];
            for (let rawConfig of configs) {
                let sessConfig = new SessionConfig(
                    rawConfig.name,
                    rawConfig.type,
                    rawConfig.config,
                    rawConfig.description,
                    rawConfig.uuid || ""
                );

                // sessConfig.on("update", handleSessionConfigUpdate);
                // sessConfig.on("remove", handleSessionConfigRemove);

                this.sessionConfigsMapper[sessConfig._id] = sessConfig;
                this.sessionConfigsUUIDMapper[sessConfig.uuid] = sessConfig;
                configObjects.push(sessConfig);
                if (rawConfig.type !== SESSION_CONFIG_TYPE.FOLDER) {
                    continue;
                }

                let subSessionConfigs = processSessionConfigs(rawConfig.subSessions || []);
                subSessionConfigs.forEach((subSessionConfig) => {
                    sessConfig.addSessionConfig(subSessionConfig);
                });
            }

            return configObjects;
        }

        processSessionConfigs(sessCfgObjects).forEach(configNode => {
            this.sessionConfigsRoot.addSessionConfig(configNode)
        });
    }

    async setConfigPath(file_path) {
        await Storage.setConfigPath(file_path)
    }

    /**
     * 保存Session的配置
     */
    async saveSessionConfigs() {
        const sessCfgObjects = this.sessionConfigsRoot.subSessions.map(sessObj => sessObj.toJSONObject(true, false));
        await Storage.save("SESSIONS", sessCfgObjects, true);
    }

    /**
     * 添加配置到父节点
     * 
     * @param {SessionConfig|Object} parent 父节点，当父节点无效时，添加到根节点下，需要注意的是Vue会把一些对象赋值直接改变成了响应式数据
     *                                      这就导致了传过来的节点已经不是原来的SessionConfig对象了
     * @param {SessionConfig} sessCfg 新增配置节点
     */
    async addSessionConfig(parent, sessCfg) {
        if (!parent) {
            this.sessionConfigsRoot.addSessionConfig(sessCfg);
        } else {
            // 根据id获取SessionConfig对象
            parent = this.sessionConfigsMapper[parent._id];
            parent.addSessionConfig(sessCfg);
        }
        // 做个ID映射
        // 做子节点的ID映射
        // 并不需要考虑太多，如果有重复的映射直接覆盖就是了
        const walkAndMap = (pNode) => {
            this.sessionConfigsMapper[pNode._id] = pNode;
            this.sessionConfigsUUIDMapper[pNode.uuid] = pNode;
            pNode.subSessions.forEach(subSession => {
                walkAndMap(subSession);
            });
        };

        walkAndMap(sessCfg)
        
        await this.saveSessionConfigs();
    }

    /**
     * 移除会话配置
     * @param {SessionConfig|Object} sessCfg 会话配置
     */
    removeSessionConfig(sessCfg) {
        // TODO: add code here
        if (!(sessCfg instanceof SessionConfig)) {
            sessCfg = this.getSessionConfigById(sessCfg._id);
        }
        sessCfg._parent.removeSubSessionConfig(sessCfg);
        this.saveSessionConfigs();
    }

    createShellSessionConfig(name) {
        const sessConfig = new SessionConfig(name , SESSION_CONFIG_TYPE.NODE, {
            sessType: "shell"
        }, "");
        // sessConfig.on("remove", (sessCfgObj) => {
        //     this.handleSessionConfigRemove(sessCfgObj);
        // });
        // sessConfig.on("update", (sessCfgObj) => {
        //     this.handleSessionConfigUpdate(sessCfgObj);
        // });

        return sessConfig;
    }

    /**
     * 导入XShell会话配置
     */
    async importXShellSession() {
        // TODO: add code here
    }

    async exportConfig(path) {
        return await Storage.export("SESSIONS", path);
    }

    async importConfig(path) {
        try{
            await Storage.import(path, "SESSIONS");
            await this.loadSessionConfigs();
        } catch(e) {
            // skip
        }
        await this.saveSessionConfigs();
    }

    /**
     * 根据会话配置ID获取配置
     * 
     * @param {Number} sessCfgId 会话配置Id
     * @return {SessionConfig}
     */
    getSessionConfigById(sessCfgId) {
        return this.sessionConfigsMapper[sessCfgId] || null;
    }

    /**
     * 根据会话配置UUID获取会话配置
     * @param {String} sessCfgUUID 会话配置UUID
     * @return {SessionConfig}
     */
    getSessionConfigByUUID(sessCfgUUID) {
        return this.sessionConfigsUUIDMapper[sessCfgUUID] || null;
    }

    /**
     * 根据会话实例ID获取会话实例
     * @param {Number} sessInstId 会话实例ID
     * @return {SessionInterface}
     */
    getSessionInstanceById(sessInstId) {
        return this.sessionInstancesMapper[sessInstId] || null;
    }

    /**
     * 添加配置和实例的关联
     * 
     * @param {Number} cfgId 配置ID
     * @param {Number} instId 实例ID
     */
    _addInstAssociation(cfgId, instId) {
        /**
         * @type {Set}
         */
        let associatedSet = this.sessionConfigAssociated[cfgId];
        if (!associatedSet) {
            associatedSet = new Set([]);
            this.sessionConfigAssociated[cfgId] = associatedSet;
        }

        associatedSet.add(instId);
        this.sessionInstAssociated[instId] = cfgId;
    }

    /**
     * 移除实例ID和配置的关联
     * 
     * @param {Number} instId 会话实例ID
     */
    _removeInstAssociation(instId) {
        const cfgId = this.sessionInstAssociated[instId];
        // cfgId必须是数字，否则是无效的或者不存在的，直接退出
        if (typeof cfgId !== "number") {
            return;
        }
        delete this.sessionInstAssociated[instId];
        /**
         * @type {Set}
         */
        let cfgAssociateSet = this.sessionConfigAssociated[cfgId];
        if (cfgAssociateSet) {
            cfgAssociateSet.delete(instId);
            if (cfgAssociateSet.size == 0) {
                // 已经不存在关联的实例了，所以直接把关系删除掉
                delete this.sessionConfigAssociated[cfgId];
            }
        }
    }

    /**
     * 添加会话到历史记录中
     * @param {String} sessionType 会话的类型
     * @param {SessionConfig} sessConfig 会话配置
     */
    addSessionToRecent(sessionType, sessConfig) {
        if (sessionType != SESSION_TYPES.SHELL) {
            return;
        }
        this.sessionRecent.addRecent(sessConfig.uuid, sessConfig.name);
    }

    /**
     * 添加一个会话创建的Job
     * 
     * @param {Number} sessCfgId 会话配置ID
     * @return {WaitObject} 等待对象
     */
    addSessionInstanceCreateJob(sessCfgId) {
        let waitObj = new WaitObject();
        this.sessionCreateJobs[sessCfgId] = waitObj;
        return waitObj;
    }

    /**
     * 获取一个会话实例创建的Job（WaitObject对象）
     * 
     * @param {Number} sessCfgId 会话配置ID
     */
    getSessionInstanceCreateJob(sessCfgId) {
        return this.sessionCreateJobs[sessCfgId];
    }

    /**
     * 会话实例创建完毕，删除此Job
     * 
     * @param {Number} sessCfgId 会话配置ID
     */
    sessionInstanceCreateJobFinish(sessCfgId) {
        delete this.sessionCreateJobs[sessCfgId];
    }

    /**
     * 创建会话实例
     * 
     * @param {SessionConfig} sessionConfig 会话配置
     * @param {Boolean} [background=false]  是否为后台会话，默认为false
     */
    async createSessionInstance(sessionConfig, background=false) {
        // 首先获取此会话配置有没有正在创建会话的Job
        let createJob = this.getSessionInstanceCreateJob(sessionConfig._id);
        if (createJob) {
            // 如果有直接等待就行了
            try {
                return await createJob.wait();
            } catch (e) {
                throw e;
            }
        }
        createJob = this.addSessionInstanceCreateJob(sessionConfig._id);

        let createParam = {
            name: sessionConfig.name,
            uuid: sessionConfig.uuid,
            connId: sessionConfig.connId === undefined ? -1 : sessionConfig.connId,
            ...sessionConfig.config
        };

        const factory = getSessionFactory(sessionConfig.config.sessType);
        try {
            /**
             * @type {SessionInterface}
             */
            let instance = await factory.createInstance(createParam);
            let instId = sessInstanceIdGenerator.getNext()
            instance.setId(instId);
            this.sessionInstancesMapper[instId] = instance;
            if (!background) {
                this.sessionInstances.push(instance);
            }
            // instance.on("close", () => {
            //     this.handleInstanceDestroy(instId);
            // });
            // 非配置型会话，内置页面会话时没有ID的
            if ("_id" in sessionConfig) {
                this._addInstAssociation(sessionConfig._id, instance.id)
            };

            // this.emit("instance-create", instance);
            EventBus.publish("instance-created", instance);

            this.addSessionToRecent(sessionConfig.config.sessType, sessionConfig);

            return instance;
        } catch (e) {
            createJob.reject(e);
            throw e;
        } finally {
            this.sessionInstanceCreateJobFinish(sessionConfig._id);
        }
    }

    /**
     * 创建欢迎会话实例
     */
    createWelcomeSessionInstance() {
        return this.createSessionInstance(new SessionConfig("Welcome", SESSION_CONFIG_TYPE.NODE, { sessType: SESSION_TYPES.WELCOME}));
    }

    createSFTPSessionInstance(sessionConfig) {
        const sftpSession = {
            ...sessionConfig.config
        };
        
        sftpSession.sessType = SESSION_TYPES.SFTP;
        let sftp_name = sftpSession.hostName === "" ? sftpSession.hostAddress : sftpSession.hostName;
        if(sftpSession.connId >= 0) {
            // reuse session uuid
            return this.createSessionInstance(new SessionConfig(sftp_name, SESSION_CONFIG_TYPE.NODE, sftpSession, "", sessionConfig.uuid));
        } else {
            return this.createSessionInstance(new SessionConfig(sftp_name, SESSION_CONFIG_TYPE.NODE, sftpSession));
        }
        
    }

    createSfpEditorSessionInstance(cfg) {
        cfg.sessType =  SESSION_TYPES.EDITOR;
        return this.createSessionInstance(new SessionConfig(cfg.name, SESSION_CONFIG_TYPE.NODE,  { sessType: SESSION_TYPES.EDITOR, config: cfg}));
    }

    /**
     * 创建登录会话实例
     */
    createLoginSessionInstance() {
        return this.createSessionInstance(new SessionConfig("Login", SESSION_CONFIG_TYPE.NODE, { sessType: SESSION_TYPES.LOGIN}));
    }
    /**
     * 创建Shell配置会话实例
     * 
     * @param {Object|Null} setting 配置
     */
    createShellSettingSessionInstance(setting) {
        return this.createSessionInstance(new SessionConfig("ShellSetting", SESSION_CONFIG_TYPE.NODE, { sessType: SESSION_TYPES.SETTING, config: setting}));
    }

    createGlobalSettingSessionInstance() {
        return this.createSessionInstance(new SessionConfig("GlobalSetting", SESSION_CONFIG_TYPE.NODE, {sessType: SESSION_TYPES.GLOBALSETTING}));
    }
    /**
     * 移除一个实例
     * 
     * @param {Number} instId 移除实例的ID
     */
    _removeInstance(instId) {
        delete this.sessionInstancesMapper[instId];
        let idx = this.sessionInstances.findIndex((val) => {
            return val.id == instId;
        });
        if (idx > -1) {
            this.sessionInstances.splice(idx, 1);
        }
        this._removeInstAssociation(instId);
    }

    handleInstanceDestroy(instId) {
        this._removeInstance(instId);
        EventBus.publish("instance-destroyed");
        // this.emit("instance-destroy");
    }

    /**
     * 复制一个会话实例
     * 
     * @param {SessionInterface} fromSessionInstance 来源会话，复制该会话
     * @param {Boolean} [useSessionConfig]  使用会话的配置，如果使用配置则只使用来源会话的配置
     *                                      否则，直接复用来源的实例
     */
    duplicateSessionInstance(fromSessionInstance, useSessionConfig = true) {
        // TODO: add code here
        let instId = fromSessionInstance.getId();
        let sessionCfg = this.getSessionConfigByInstanceId(instId);
        return this.createSessionInstance(sessionCfg);
    }

    async duplicateSshInstance(fromSessionInstance, useSessionConfig = true) {
        let connId = -1;
        try {
            connId = await fromSessionInstance.getTermConnId();
        } catch(e) {
            console.log('duplicate ssh instance error ', e);
            return;
        }

        let instId = fromSessionInstance.getId();
        let sessionCfg = this.getSessionConfigByInstanceId(instId);
        return this.createSessionInstance({connId , ...sessionCfg});
    }

    /**
     * 获取会话实例
     * 
     * @param {SessionInterface | Number} instance 会话实例
     */
    getSessionInstance(instance) {
        if (typeof instance === "number") {
            return this.sessionInstances[instance] || null;
        }

        return instance;
    }

    /**
     * 获取会话配置
     * 
     * @return {SessionConfig[]}
     */
    getSessionConfigs() {
        return this.sessionConfigsRoot.subSessions;
    }

    /**
     * 获取会话实例列表
     */
    getSessionIntances() {
        return this.sessionInstances;
    }

    /**
     * 根据会话实例获取对应的会话配置
     * 
     * @param {Number} instId 会话实例
     * @return {SessionConfig}
     */
    getSessionConfigByInstanceId(instId) {
        const cfgId = this.sessionInstAssociated[instId];
        if (cfgId === undefined) {
            return null;
        }
        return this.sessionConfigsMapper[cfgId];
    }

    /**
     * 根据会话配置匹配会话实例
     * @param {SessionConfig} sessCfg 会话配置
     * @return {SessionInterface[]}
     */
    matchSessionInstanceByConfig(sessCfg) {
        let instSets = this.sessionConfigAssociated[sessCfg._id];
        if (!instSets || instSets.size == 0) {
            return null;
        }

        let matched = [];
        for (let inst of this.sessionInstances) {
            if (instSets.has(inst.id)) {
                matched.push(inst);
            }
        }

        return matched;
    }

    /**
     * 根据会话类型匹配会话实例
     * @param {String} sessType 类型名称
     * @return {SessionInterface[]}
     */
    matchSessionInstanceBySessionType(sessType) {
        return this.sessionInstances.filter(
            /**
             * @param {SessionInterface} instance
             */
            (instance) => {
                if (instance.type === sessType) {
                    return instance;
                }
            }
        )
    }

    getSessionRecent() {
        return this.sessionRecent;
    }
}

const sessionManager = new SessionManager();

export default sessionManager;
