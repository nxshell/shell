const { NxNode } = require("../../common/nxsys/nodes");
const { createObjectHandle, closeObject } = require("../nxobjs");
const { IdGenerator } = require("../../common/utils/idGenerator");


class NxNodeConnection {
    refCount = 0
    constructor(nativeConn) {
        this.conn = nativeConn;
    }

    ref() {
        this.refCount++;
        return this.conn;
    }

    unref(releaseCallback) {
        this.refCount--;
        if (this.refCount === 0) {
            releaseCallback(this.conn);
        }
    }
}

class NxNodeServer extends NxNode {
    connections = Object.create(null);
    idGenerator = new IdGenerator();

    // need override
    async _createConnection() {
    }

    // need override
    _closeConnection(conn) {
    }

    getConnection(connId) {
        return this.connections[connId] || null;
    }

    refConnection(connId) {
        let conn = this.connections[connId];
        if (!conn) {
            throw new Error("Invalid connection id:", connId);
        }
        return conn.ref();
    }

    closeConnection(connId) {
        const connWrap = this.connections[connId];
        if (!connWrap) {
            return;
        }
        connWrap.unref((conn) => {
            this._closeConnection(conn);
        });
    }

    closeAllConnections() {
        Object.keys(this.connections).forEach(connId => {
            this.closeConnection(connId);
        });
    }

    async createConnection() {
        const conn = await this._createConnection();
        const connId = this.idGenerator.getNext();
        const connWrap = new NxNodeConnection(conn);
        this.connections[connId] = connWrap;

        return connId;
    }
}

module.exports = {
    NxNodeServer
}