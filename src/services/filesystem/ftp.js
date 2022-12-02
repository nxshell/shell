import { PtSFTPFileSystemClient } from "../../../common/filesystem/filesystem";
import { FStats } from "../../../common/filesystem/fstat";
const WaitObject = require("../../../common/utils/waitObject");

class Dirent extends FStats {
    name = ""
    
    constructor(name, stat) {
        super(stat);
        this.name = name;
        this.stat = stat;
    }

    isBlockDevice() {
        return false;
    }

    isCharacterDevice() {
        return false;
    }

    isDirectory() {
        return this.stats.type === 'd';
    }

    isFIFO() {
        return false;
    }

    isFile() {
        return this.stats.type === '-';
    }

    isSocket() {
        return false;
    }

    isSymbolicLink() {
        return this.stats.type === 'l';
    }

    getUid() {
        return this.stats.owner;
    }

    getGid() {
        return this.stats.group;
    }

    getSize() {
        return this.stats.size;
    }

    getATime() {
        return new Date(this.stats.date);
    }

    getMTime() {
        return new Date(this.stats.date);
    }

    getPermsString() {
        return this.stats.rights.user + this.stats.rights.group + this.stats.rights.other;
    }
}

export class FTPFileSystem extends PtSFTPFileSystemClient {
    serviceProxy = null;
    service = null;
    constructor(handle) {
        super(handle);
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

    async readdir(location) {
        const dirList = await this.service.callObject(this.handle, 'readdir', location);
        return dirList.map((dirent) => {
            return new Dirent(dirent.name, dirent)
        });
    }

    async lstat(path) {
        const stat = await this.service.callObject(this.handle, "lstat", path);
        return stat;
    }

    async mkdir(path, attrs) {
        return await this.service.callObject(this.handle, "mkdir", path, attrs);
    }

    async rmdir(path) {
        return await this.service.callObject(this.handle, "rmdir", path);
    }

    async unlink(path) {
        return await this.service.callObject(this.handle, "unlink", path);
    }

    async readFileContent(local_file) {
        return await this.service.callObject(this.handle, "syncGetLocalFileContent", local_file);
    }

    async writeFileContent(local_file, v) {
        return await this.service.callObject(this.handle, "syncWriteLocalFileContent", local_file, v);
    }

    async syncLocalToRemote(remote, local) {
        return await this.service.callObject(this.handle, "syncLocalToRemote", remote, local);
    }

    async syncRemoteToLocal(remote, local) {
        return await this.service.callObject(this.handle, "syncRemoteToLocal", remote, local);
    } 

    async dispose() {
        this.service.closeObject(this.handle);
    }
}
