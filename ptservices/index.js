const { callObject, closeObject } = require("./nxobjs");
const { createNodeSessionInstance, getNodeSessionInstanceByUUID } = require("./nodes");
const { createDataTransfer } = require("./dataTransfer");
const { createFileStorage } = require("./localFileStorage");
const { getSerialPorts } = require("./nodesimpl/serialportnodes");
const { createLogger } = require("./logger");
const { getSystemFonts } = require("./fontList");

powertools.createHsIPCServer();

module.exports = {
    add(v1, v2) {
        return v1 + v2;
    },
    callObject,
    closeObject,
    createNodeSessionInstance,
    getNodeSessionInstanceByUUID,
    createDataTransfer,
    createFileStorage,
    getSerialPorts,
    createLogger,
    getSystemFonts,
    getHsIPCHandle: () => { return powertools.getHsIPCConnectFile() }
};
