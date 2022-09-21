const path = require("path");
const { EventEmitter } = require("events");

/**
 * 文件系统
 * Node File System 子集
 */
class PtFileSystem extends EventEmitter {
    name = "ptfs"
    constructor(name) {
        super();
        this.name = name;
    }

    async getconn() {
        return -1;
    }

    async open(name, flags) {
        throw new Error("Unimplemented");
    }
    async close(handle) {
        throw new Error("Unimplemented");
    }
    async read(handle, buffer, offset, length, position) {
        throw new Error("Unimplemented");
    }
    async write(handle, buffer, offset, length, position) {
        throw new Error("Unimplemented");
    }
    async fstat(handle) {
        throw new Error("Unimplemented");
    }
    async fsetstat(handle, attr) {
        throw new Error("Unimplemented");
    }
    async futimes(handle, atime, mtime) {
        throw new Error("Unimplemented");
    }
    async fchown(handle, uid, gid) {
        throw new Error("Unimplemented");
    }
    async fchmod(handle, mode) {
        throw new Error("Unimplemented");
    }
    async opendir(path) {
        throw new Error("Unimplemented");
    }
    async readdir(location) {
        throw new Error("Unimplemented");
    }
    async unlink(path) {
        throw new Error("Unimplemented");
    }
    async rename(srcPath, destPath) {
        throw new Error("Unimplemented");
    }
    async mkdir(path, attr) {
        throw new Error("Unimplemented");
    }
    async rmdir(path) {
        throw new Error("Unimplemented");
    }
    async stat(path) {
        throw new Error("Unimplemented");
    }
    async lstat(path) {
        throw new Error("Unimplemented");
    }
    async setstat(path, attr) {
        throw new Error("Unimplemented");
    }
    async utimes(path, atime, mtime) {
        throw new Error("Unimplemented");
    }
    async chown(path, uid, gid) {
        throw new Error("Unimplemented");
    }
    async chmod(path, mode) {
        throw new Error("Unimplemented");
    }
    async readlink(path) {
        throw new Error("Unimplemented");
    }
    async symlink(targetPath, linkPath) {
        throw new Error("Unimplemented");
    }
    async realpath(path) {
        throw new Error("Unimplemented");
    }

    /** 
     * Node的标准库已经不建议使用exists函数，建议使用stat来做
     * 但是我们现在接入的VFS实现出的stat函数并不一致
     */
    async exists(path) {
        throw new Error("Unimplemented");
    }

    async walk(rootDir, deepFirst=true) {
        const result = [];
        if (!deepFirst) {
            result.push({
                isDir: true,
                entryPath: rootDir
            });
        }
        const walk = async (dirPath) => {
            const fileList = await this.readdir(dirPath);
            if (deepFirst) {
                for (let i = 0; i < fileList.length; i++) {
                    const dirent = fileList[i];
                    const entryPath = path.resolve(dirPath, dirent.name);
                    let isDir = false;
                    if (dirent.isDirectory()) {
                        await walk(entryPath);
                        isDir = true;
                    }
                    result.push({
                        isDir,
                        entryPath
                    });
                }
            } else {
                for (let i = 0; i < fileList.length; i++) {
                    const dirent = fileList[i];
                    const entryPath = path.resolve(dirPath, dirent.name);
                    const folderList = [];
                    let isDir = false;
                    if (dirent.isDirectory()) {
                        folderList.push(entryPath);
                        isDir = true;
                    }
                    result.push({
                        isDir,
                        entryPath
                    });
                    for (let j = 0; i < folderList.length; j++) {
                        await walk(folderList[i]);
                    }
                }
            }
        }

        await walk(rootDir);
        if (deepFirst) {
            result.push({
                isDir: true,
                entryPath: rootDir
            });
        }

        return result;
    }
}

class PtSFTPFileSystemClient extends PtFileSystem{
    handle = null;
    constructor(handle) {
        super("sftpfs");
        this.handle = handle;
    }

    async init() {
        throw new Error("Unimplemented");
    }

    async remove(filePath) {
        return await this.unlink(filePath);
    }
}

module.exports = {
    PtFileSystem,
    PtSFTPFileSystemClient
};
