const { NxNode } = require("../common/nxsys/nodes");
const { getNodeClassByProtocol } = require("./nodesimpl/registry");
require("./nodesimpl/sshnodes");
require("./nodesimpl/localnode");
require("./nodesimpl/ftpnode");
require("./nodesimpl/serialportnodes");
require("./nodesimpl/telnetnodes");
require("./nodesimpl/localshellnodes");
const { createObjectHandle, getObject } = require("./nxobjs");
const { PROTOCOLS } = require("../common/nxsys/consts");

const nodesInstances = Object.create(null);

/**
 * 根据sessionUUID获取Session会话实例
 * 
 * @param {String} sessionUUID 会话UUID
 * @returns {NxNode}
 */
function getNodeSessionInstanceByUUID(sessionUUID) {
    const handler = nodesInstances[sessionUUID];
    if (typeof handler !== "number") {
        return null;
    }
    return getObject(handler);
}

/**
 * 创建一个节点会话实例
 * @param {String} sessionUUID 会话配置UUID
 * @param {Object} sessionConfig 会话配置
 * @param {String} sessionConfig.protocal 会话（协议）
 * @param {String} sessionConfig.uuid 会话节点UUID
 */
function createNodeSessionInstance(sessionUUID, sessionConfig) {
    let handler = nodesInstances[sessionUUID];
    if (typeof handler === "number") {
        return handler;
    }
    const NodeClass = getNodeClassByProtocol(sessionConfig.protocal);
    //console.log(NodeClass, sessionConfig);
    const instance = new NodeClass(sessionUUID, sessionConfig.protocal, sessionConfig);

    handler = createObjectHandle(instance);
    nodesInstances[sessionUUID] = handler;

    instance.on("dispose", () => {
        delete nodesInstances[sessionUUID];
    });

    return handler;
}

/** create local node */
createNodeSessionInstance("", {protocal: PROTOCOLS.LOCAL, uuid: ""})

module.exports = {
    createNodeSessionInstance,
    getNodeSessionInstanceByUUID
}