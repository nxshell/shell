import { PtSFTPFileSystemClient } from "../../../common/filesystem/filesystem";
import { FStats } from "../../../common/filesystem/fstat";


class Dirent extends FStats {
    name=""
    
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
        return this.stats.type === 'directory';
    }

    isFIFO() {
        return false;
    }

    isFile() {
        return this.stats.type === 'file';
    }

    isSocket() {
        return false;
    }

    isSymbolicLink() {
        return false;
    }

    getUid() {
        return 0;
    }

    getGid() {
        return 0;
    }

    getSize() {
        return this.stats.size;
    }

    getATime() {
        return new Date(this.stats.lastmod);
    }

    getMTime() {
        return new Date(this.stats.lastmod);
    }

    getPermsString() {
        return '---------';
    }
}

export class WDFileSystem extends PtSFTPFileSystemClient {
    serviceProxy = null;
    service = null;
    constructor(handle) {
        super(handle);
    }

    async init() {
        this.service = powertools.getService();
    }

    async open(fileName, flags) {
        return await this.service.callFs(this.handle, 'open', ...[fileName, flags]);
    }

    async readdir(location) {
        const dirList = await this.service.callFs(this.handle, 'readdir', location);
        return dirList.map((dirent) => {
            return new Dirent(dirent.basename, dirent)
        });
    }

    async lstat(path) {
        const stat = await this.service.callFs(this.handle, "lstat", path);
        return stat;
    }

    async mkdir(path, attrs) {
        return await this.service.callFs(this.handle, "mkdir", path, attrs);
    }

    async rmdir(path) {
        return await this.service.callFs(this.handle, "rmdir", path);
    }

    async unlink(path) {
        return await this.service.callFs(this.handle, "unlink", path);
    }

    async dispose() {
        const service = powertools.getService();
        await service.closeFsInstance(this.handle);
    }
}
