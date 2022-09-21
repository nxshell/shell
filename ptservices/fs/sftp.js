const os = require('os');
const path = require('path');
const fs = require('fs');
const { PtFileSystem } = require("../../common/filesystem/filesystem");
const { Dirent } = require("../../common/filesystem/dirent")
const { IdGenerator } = require("../../common/utils/idGenerator");
const { resolve } = require('path');

function normalizeAttr(attrs) {
    return {
        mode: attrs.mode,
        uid: attrs.uid,
        gid: attrs.gid,
        size: attrs.size,
        atime: new Date(attrs.atime * 1000),
        mtime: new Date(attrs.mtime * 1000)
    }
}

function normalizeStat(stats) {
    stats.atime = new Date(stats.atime * 1000);
    stats.mtime = new Date(stats.mtime * 1000);
    return stats;
}

class SFTPFileSystem extends PtFileSystem {
    openedFiles = null;
    sftp = null;
    cwd = './';
    parent = null;
    connId = -1;
    /** @type {IdGenerator} */
    handleGenerator = new IdGenerator(1);

    constructor(parent, connId) {
        super();
        this.parent = parent;
        this.openedFiles = Object.create(null);
        this.connId = connId;
    }

    async init() {
        await new Promise((resolve, reject) => {
            const conn = this.parent.refConnection(this.connId);
            conn.sftp((err, sftp)=>{
                if(err) {
                    reject(err)
                } else {
                    this.sftp = sftp;
                    resolve()
                }
            });
        })
    }
    
    async getconn() {
        return this.connId;
    }

    async realpath(path) {
        return await new Promise((resolve, reject)=>{
            this.sftp.realpath(path, (error, p)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(p);
                }
            })
        })
    }

    async readdir(location) {
        return await new Promise((resolve, reject)=>{
            this.sftp.readdir(location || this.cwd, (error, list)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(list.map(entry => new Dirent(entry.filename, normalizeAttr(entry.attrs))));
                }
            })
        })
    }

    async stat(path) {
        return await new Promise((resolve, reject)=>{
            this.sftp.stat(path || this.cwd, (error, stats)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(normalizeStat(stats));
                }
            })
        })
    }

    async lstat(path) {
        return await new Promise((resolve, reject) => {
            this.sftp.lstat(path || this.cwd, (error, stats)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(normalizeStat(stats));
                }
            });
        })
    }

    async rename(src, dest) {
        return await new Promise((resolve, reject)=>{
            this.sftp.rename(src, dest, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async mkdir(path, attrs) {
        return await new Promise((resolve, reject)=>{
            this.sftp.mkdir(path, attrs || {}, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async rmdir(path) {
        return await new Promise((resolve, reject)=>{
            this.sftp.rmdir(path, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async open(filename, flags) {
        /***
         *  flags:
         * 'a': 打开文件用于追加。 如果文件不存在，则创建该文件。
         * 'a': 打开文件用于追加。 如果文件不存在，则创建该文件。
         * 'a+': 打开文件用于读取和追加。 如果文件不存在，则创建该文件。
         * 'ax+': 类似于 'a+'，但如果路径存在，则失败。
         * 'as': 打开文件用于追加（在同步模式中）。 如果文件不存在，则创建该文件。
         * 'as': 打开文件用于追加（在同步模式中）。 如果文件不存在，则创建该文件。
         * 'r': 打开文件用于读取。 如果文件不存在，则会发生异常。
         * 'r+': 打开文件用于读取和写入。 如果文件不存在，则会发生异常。
         * 'w': 打开文件用于写入。 如果文件不存在则创建文件，如果文件存在则截断文件。
         * 'wx': 类似于 'w'，但如果路径存在，则失败。
         * 'w+': 打开文件用于读取和写入。 如果文件不存在则创建文件，如果文件存在则截断文件。
         * 'wx+': 类似于 'w+'，但如果路径存在，则失败。
        */
        return await new Promise((resolve, reject)=>{
            this.sftp.open(filename, flags, (error, handle)=> {
                if(error) {
                    reject(error);
                    return;
                }

                let retHanlde = this.handleGenerator.getNext();
                this.openedFiles[retHanlde] = handle;
                resolve(retHanlde);
            })
        })
    }

    async read(handle, buffer, offset, length, position) {
        return await new Promise((resolve, reject)=>{
            if(! this.openedFiles[handle]) {
                reject(new Error('handle no exits'));
                return;
            }
            this.sftp.read(this.openedFiles[handle], buffer, offset, length, position, (error, bytesRead, buff, pos)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve({
                        bytesRead,
                        //buffer: buffer
                    });
                }
            })
        })
    }

    async write(handle, buffer, offset, lenght, position) {
        return await new Promise((resolve, reject) => {
            if (!this.openedFiles[handle]) {
                reject(new Error("Invalid file handle"));
                return;
            }

            this.sftp.write(this.openedFiles[handle], buffer, offset, lenght, position, (err, bytesWrite, buff) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(bytesWrite)
            });
        });
    }

    async close(handle) {
        return await new Promise((resolve, reject)=>{
            if(!this.openedFiles[handle]) {
                reject(new Error('Invalid file handle'));
            }

            this.sftp.close(this.openedFiles[handle], (error)=> {
                if(error) {
                    reject(error);
                } else {
                    delete this.openedFiles[handle];
                    resolve(true);
                }
            })
        })
    }

    async unlink(path) {
        return await new Promise((resolve, reject)=>{
            this.sftp.unlink(path, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async readlink(path) {
        return await new Promise((resolve, reject)=>{
            this.sftp.readlink(path, (error, s)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(s);
                }
            })
        })
    }

    async chmod(path, permission) {
        return await new Promise((resolve, reject)=>{
            this.sftp.chmod(path, permission, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async exists(path) {
        try {
            await this.stat(path);
        } catch (e) {
            if (e.message.trim() === "No such file") {
                return false;
            }
        }
        return true;
    }
    
    async syncRemoteToLocal(remote_path, local_file) {
        const local_path = path.join(os.tmpdir(), local_file)
        return new Promise((resolve, reject)=> {
            this.sftp.fastGet(remote_path, local_path, (error)=> {
                if(error) {
                    reject()
                } else {
                    resolve()
                }
            })
        })
    }

    async syncLocalToRemote(remote_path, local_file) {
        const local_path = path.join(os.tmpdir(), local_file)
        return new Promise((resolve, reject)=> {
            this.sftp.fastPut(local_path, remote_path, (error)=> {
                if(error) {
                    reject()
                } else {
                    resolve()
                }
            })
        })
    }

    async syncGetLocalFileContent(local_file) {
        const local_path = path.join(os.tmpdir(), local_file)
        return fs.readFileSync(local_path);
    }

    async syncWriteLocalFileContent(local_file, v) {
        const local_path = path.join(os.tmpdir(), local_file)
        return fs.writeFileSync(local_path, v);
    }

    dispose() {
        // TODO: 关闭所有已经打开的文件句柄
        for(let index in this.openedFiles) {
            this.close(index);
        }
        // this.sftp.close();
        this.sftp.end();
        this.parent.closeConnection(this.connId);
        this.emit("dispose");
        this.removeAllListeners();
    }
}

module.exports = {
    SFTPFileSystem
}
