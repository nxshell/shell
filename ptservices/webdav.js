const { createClient, AuthType } = require("webdav");

const { PtFileSystem } = require("../common/filesystem/filesystem");

class WDFileSystem extends PtFileSystem {
    openedFiles = null;
    webDavClient = null;
    cwd = './';

    constructor(sessConfig) {
        super();
        this.openedFiles = Object.create(null);
        this.authConfig = sessConfig;
    }

    async connect() {
        let url = this.authConfig.url;
        let options = {
            authType: AuthType.Password,
            username: this.authConfig.username,
            password: this.authConfig.password
        }

        this.webDavClient = createClient(url, options);
        return true;
    }

    async readdir(location) {
        let list = await this.webDavClient.getDirectoryContents(location);
        return list;
    }

    async stat(path) {
        let s = await this.webDavClient.stat(path);
        return s;
    }

    async lstat(path) {
        return await this.stat(path);
    }

    async rename(src, dest) {
        await this.webDavClient.copyFile(src, dest);
        return true;
    }

    async mkdir(path, attrs) {
        await this.webDavClient.createDirectory(path);
        return true;
    }

    async rmdir(path) {
        await this.unlink(path);
        return true;
    }

    async open(filename, flags) {
        let readStrem = await this.webDavClient.createReadStream(filename);
        this.openedFiles[filename] = readStrem;
        return filename;
    }

    async read(handle, buffer, offset, length, position) {
        
    }

    async close(handle) {
        if(! this.openedFiles[handle]) {
            return false;
        }
        this.openedFiles[handle].destroy();
        delete this.openedFiles[handle]
        return true;
    }

    async unlink(path) {
        await this.webDavClient.deleteFile(path);
        return true
    }

    dispose() {
        // TODO: 关闭所有已经打开的文件句柄
        // TODO: 断开连接
        for(var index in this.openedFiles) {
            this.close(index);
        }
        if(this.webDavClient) {
            this.webDavClient = null;
        }
    }
}

module.exports = {
    WDFileSystem
};
