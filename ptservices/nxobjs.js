/**
 * NxObjects
 */

const utils = require("../common/utils");
const { IdGenerator } = require("../common/utils/idGenerator");

const objHandleIdGenerator = new IdGenerator();

const objectsRegistry = Object.create(null);

function createObjectHandle(object) {
    const handleId = objHandleIdGenerator.getNext();
    objectsRegistry[handleId] = object;
    return handleId;
}

function getObject(handleId) {
    let obj = objectsRegistry[handleId];
    if (!obj) {
        throw new Error("invalid handle id");
    }
    return obj;
}

async function closeObject(handleId) {
    try {
        let ret = callObject(handleId, "dispose");
        if (utils.isPromise) {
            ret = await ret;
        }
        return ret;
    } catch (err) {
        console.err(err);
    } finally {
        if (objectsRegistry[handleId]) {
            delete objectsRegistry[handleId];
        }
    }
}

function callObject(handleId, method, ...args) {
    let obj = getObject(handleId);

    return obj[method].call(obj, ...args);
}

module.exports = {
    createObjectHandle,
    getObject,
    closeObject,
    callObject
};
