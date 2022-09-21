const fs = require('fs');
const path = require('path');
const { PtFileSystem } = require("../../common/filesystem/filesystem");
const { IdGenerator } = require("../../common/utils/idGenerator");

class LOCALFileSystem extends PtFileSystem {
    openedFiles = null;
    cwd = './';
    parent = null;

    /** @type {IdGenerator} */
    handleGenerator = new IdGenerator(1);

    constructor(parent) {
        super();
        this.parent = parent;
        this.openedFiles = Object.create(null);
    }

    async init() {
        return true;
    }

    async readdir(location) {
        return await new Promise((resolve, reject)=>{
            fs.readdir(location || this.cwd, {withFileTypes: true}, (error, list) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(list);
                }
            })
        })
    }

    async stat(path) {
        return await new Promise((resolve, reject)=>{
            fs.stat(path || this.cwd, (error, stats)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(stats);
                }
            })
        })
    }

    async lstat(path) {
        return await new Promise((resolve, reject) => {
            fs.lstat(path || this.cwd, (error, stats)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(stats);
                }
            });
        })
    }

    async rename(src, dest) {
        return await new Promise((resolve, reject)=>{
            fs.rename(src, dest, (error)=> {
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
            fs.mkdir(path, attrs || {}, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async rmdir(path, opt) {
        return await new Promise((resolve, reject)=>{
            fs.rmdir(path, opt|| {}, (error)=> {
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
            fs.open(filename, flags, (error, fd)=> {
                if(error) {
                    reject(error);
                } else {
                    // TODO, check if exists
                    let retHanlde = this.handleGenerator.getNext();
                    this.openedFiles[retHanlde] = fd;
                    resolve(retHanlde);
                }
            })
        })
    }

    async read(handle, buffer, offset, length, position) {
        return await new Promise((resolve, reject)=>{
            if(!this.openedFiles[handle]) {
                reject(new Error('Invalid file handle:' + handle));
            }
            fs.read(this.openedFiles[handle], buffer, offset, length, position, (error, bytesRead, buff)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve({
                        bytesRead,
                        buffer: buff
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
            fs.write(this.openedFiles[handle], buffer, offset, lenght, position, (err, bytesWrite, buff) => {
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
            if(! this.openedFiles[handle]) {
                reject(new Error('Invalid file handle:' + handle));
                return;
            }

            fs.close(this.openedFiles[handle], (error)=> {
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
            fs.unlink(path, (error)=> {
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
            if (e.code === "ENOENT") {
                return false;
            }
        }
        return true;
    }

    async pathresolve(path1, path2){
        return path.resolve(path1, path2);
    }

    async basename(path1) {
        return path.basename(path1);
    }

    dispose() {
        // TODO: 关闭所有已经打开的文件句柄
        for(let index in this.openedFiles) {
            this.close(index);
        }
        this.emit("dispose");
        this.removeAllListeners();
    }
}

module.exports = {
    LOCALFileSystem
}
