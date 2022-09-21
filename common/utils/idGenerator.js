/**
 * 整数ID生成器
 * Id最大有效个数为 Number.MAX_SAFE_INTEGER(V8：9007199254740991)
 * 足够使用，所以不考虑回环的问题
 */
class IdGenerator {
    lastId = 0
    constructor(initId=0) {
        this.lastId = initId;
    }

    getNext() {
        return this.lastId++
    }
}

const globalIdGenerator = new IdGenerator();

function getGlobalId() {
    return globalIdGenerator.getNext();
}

module.exports = {
    IdGenerator,
    getGlobalId
};
