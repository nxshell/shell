import { Dirent } from "../../../common/filesystem/dirent";
const WaitObject = require("../../../common/utils/waitObject");
const { PROTOCOLS } = require("../../../common/nxsys/consts");

class LocalFileClient {
    /**
     * @type {WaitObject}
     */
    initialized = null;
    service = null;
    constructor(handle) {
        this.handle = handle;
        this.service = powertools.getService();
    }

    async init() {
        if (this.initialized) {
            await this.initialized.wait();
            return;
        }
        this.initialized = new WaitObject();
        try {
            await this.service.callObject(this.handle, 'init');
            this.initialized.resolve()
        } catch (err) {
            this.initialized.reject(err);
        }
    }
    async getconn() {
        return await this.service.callObject(this.handle, 'getconn');
    }

    async open(fileName, flags) {
        return await this.service.callObject(this.handle, 'open', ...[fileName, flags]);
    }

    async write(handle, buffer, offset, length, position) {
        return await this.service.callObject(this.handle, 'write', ...[handle, buffer, offset, length, position]);
    }

    async read(handle, buffer, offset, length, position) {
        return await this.service.callObject(this.handle, 'read', ...[handle, buffer, offset, length, position]);
    }

    async readdir(location) {
        const dirList = await this.service.callObject(this.handle, 'readdir', location);
        return dirList.map((dirent) => {
            return new Dirent(dirent.name, dirent.stats)
        });
    }

    async lstat(path) {
        const stat = await this.service.callObject(this.handle, "lstat", path);
        return stat;
    }

    async stat(path) {
        const stat = await this.service.callObject(this.handle, "stat", path);
        return stat;
    }

    async realpath(path) {
        const p = await this.service.callObject(this.handle, "realpath", path);
        return p;
    }

    async mkdir(path, attrs) {
        return await this.service.callObject(this.handle, "mkdir", path, attrs);
    }

    async rmdir(path) {
        return await this.service.callObject(this.handle, "rmdir", path);
    }

    async rename(srcPath, destPath) {
        return await this.service.callObject(this.handle, "rename", srcPath, destPath);
    }

    async unlink(path) {
        return await this.service.callObject(this.handle, "unlink", path);
    }

    async exists(path) {
        return await this.service.callObject(this.handle, "exists", path);
    }

    async pathresolve(path1, path2) {
        return await this.service.callObject(this.handle, "pathresolve", path1, path2);
    }

    async basename(path) {
        return await this.service.callObject(this.handle, "basename", path);
    }

    async close(handle) {
        return await this.service.callObject(this.handle, "close", handle);
    }

    async dispose() {
        this.service.closeObject(this.handle);
    }
}

export async function createLocalFs() {
    const service = powertools.getService();

    const handle = await service.createNodeSessionInstance("", {protocal: PROTOCOLS.LOCAL, uuid: ""});
    const fshandle = await service.callObject(handle, 'getFSInstance');
    const client = new LocalFileClient(fshandle);
    await client.init();

    return client;
}
