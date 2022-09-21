import { PtSFTPFileSystemClient } from "../../../common/filesystem/filesystem";
import { Dirent } from "../../../common/filesystem/dirent";
const WaitObject = require("../../../common/utils/waitObject");

export class SFTPFileSystem extends PtSFTPFileSystemClient {
    /**
     * @type {WaitObject}
     */
    initialized = null;
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
            return new Dirent(dirent.name, dirent.stats)
        });
    }

    async lstat(path) {
        const stat = await this.service.callObject(this.handle, "lstat", path);
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

    async readlink(path) {
        return await this.service.callObject(this.handle, "readlink", path);
    }

    async exists(path) {
        return await this.service.callObject(this.handle, "exists", path);
    }

    async chmod(path, permission) {
        return await this.service.callObject(this.handle, "chmod", path, permission);
    }

    async dispose() {
        this.service.closeObject(this.handle);
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
}
