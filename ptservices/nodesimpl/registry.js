const { PROTOCOLS } = require("../../common/nxsys/consts");

const nodeImplRegistry = Object.create(null);

/**
 * 注册节点实现
 * @param {String} nodeProtocol 节点所使用的连接协议
 * @param {Class} nodeImplClass 节点实现
 */
function register(nodeProtocol, nodeImplClass) {
    const protocol = nodeProtocol.toUpperCase();
    if (!(protocol in PROTOCOLS)) {
        throw new Error("Unimplementd protocol: " + nodeProtocol);
    }
    nodeImplRegistry[protocol] = nodeImplClass;
}

/**
 * 根据协议名获取节点实现类
 */
function getNodeClassByProtocol(nodeProtocol) {
    const protocol = nodeProtocol.toUpperCase();
    return nodeImplRegistry[protocol];
}

module.exports = {
    register,
    getNodeClassByProtocol
};
