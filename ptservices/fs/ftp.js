const os = require('os');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require("events");
const { PtFileSystem } = require("../../common/filesystem/filesystem");
const { IdGenerator } = require("../../common/utils/idGenerator");

class Dirent {
    constructor(stats) {
        this.type = stats.type;
        this.name = stats.name;
        this.target = stats.target;
        this.sticky = stats.sticky;
        this.rights = stats.rights;
        this.acl = stats.acl;
        this.owner = stats.owner;
        this.group = stats.group;
        this.size = stats.size;
        this.date = stats.date;
    }
    isDirectory() {
        return this.type === 'd';
    }
}

class ftpFileObject extends EventEmitter {
    constructor(total){
        super();
        this.total = total;
        this.size = 0;
        this.buffer = Buffer.alloc(0);
    }
    
    appendBuffer(buffer) {
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.size += buffer.length;
        this.emit("datain");
    }

    copyBuffer(destBuffer, destStart, length, position) {
        let copySize = ((position + length) > this.size) ? (this.size - position) : length;
        this.buffer.copy(destBuffer, destStart, position, position + copySize);
        return copySize;
    }

    isfull() {
        return this.size === this.total;
    }
}

class FTPFileSystem extends PtFileSystem {
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
        this.openedFileBuffers = Object.create(null);
        this.connId = connId;
    }

    async init() {
        this.ftp_client = this.parent.refConnection(this.connId);
        return true;
    }
    
    async getconn() {
        return this.connId;
    }

    async readdir(location) {
        return new Promise((resolve, reject)=>{
            this.ftp_client.list(location || this.cwd, (error, list)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(list.map(entry => new Dirent(entry)));
                }
            })
        })
    }

    _path_dir_basename(paths) {
        let dir = path.dirname(paths);
        let basename = path.basename(paths);
        return {dir, basename};
    }

    async stat(path) {
        let status = [];
        try {
            status = await this.readdir(path);
        }catch(e) {
            //sktip;
        }
        const {dir, basename} = this._path_dir_basename(path);
        let stats = status.find((el)=>{ return el.name == basename});
        if(stats) {
            return new Dirent(stats);
        }
        try {
            status = await this.readdir(dir);
        }catch(e) {
            //sktip;
        }
        stats = status.find((el)=>{ return el.name == basename});
        if(stats) {
            return new Dirent(stats);
        }
        return null;
    }

    async lstat(path) {
        return this.stat(path);
    }

    async rename(src, dest) {
        return new Promise((resolve, reject)=>{
            this.ftp_client.rename(src, dest, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async mkdir(path, attrs) {
        return new Promise((resolve, reject)=>{
            this.ftp_client.mkdir(path, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async rmdir(path) {
        return new Promise((resolve, reject)=>{
            this.ftp_client.rmdir(path, (error)=> {
                if(error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async open(filename, flags) {
        let that = this;
        if(flags === 'r') {
            let stats = await this.stat(filename);
            let sizeByte = stats.size;
            return new Promise((resolve, reject)=>{
                this.ftp_client.get(filename, (error, handle)=> {
                    if(error) {
                        reject(error);
                    } else {
                        let retHanlde = that.handleGenerator.getNext();
                        let fileObject = new ftpFileObject(sizeByte);
                        that.openedFiles[retHanlde] = handle;
                        that.openedFileBuffers[retHanlde] = fileObject;
                        let readStreams = that.openedFiles[retHanlde];
                        readStreams.on('data', (data)=> {
                            fileObject.appendBuffer(data);
                        })
                        handle.resume();
                        resolve(retHanlde);
                    }
                })
            })
        } else {
            // write file
            let retHanlde = that.handleGenerator.getNext();
            that.openedFiles[retHanlde] = filename;
            return retHanlde;
        }
        
    }

    async read(handle, buffer, offset, length, position) {
        return new Promise((resolve, reject)=>{
            if(! this.openedFiles[handle]) {
                reject(new Error('handle no exits'));
            }
            // TODO need recompute position
            let readStreams = this.openedFiles[handle];
            let fileObject = this.openedFileBuffers[handle];
            if(fileObject.isfull() || ((length + position) <= fileObject.size )) {
                resolve({bytesRead: fileObject.copyBuffer(buffer, offset, length, position)})
            } else {
                function listenOnce() {
                    fileObject.once('datain', ()=> {
                        if ((length + position) <= fileObject.size ) {
                            resolve({bytesRead: fileObject.copyBuffer(buffer, offset, length, position)});
                        } else {
                            listenOnce();
                        }
                    })
                }

                listenOnce();
                
                readStreams.on('error', (e)=> {
                    console.log('ftp stream read error ', e);
                    reject(e)
                })
            }
        })
    }

    async write(handle, buffer, offset, length, position) {
        return await new Promise((resolve, reject) => {
            if (!this.openedFiles[handle]) {
                reject(new Error("Invalid file handle"));
                return;
            }

            let filename = this.openedFiles[handle];

            if(!position) {
                //write first contents
                this.ftp_client.put(buffer.slice(offset, offset + length), filename, (error)=> {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(length)
                    }
                })
            } else {
                this.ftp_client.append(buffer.slice(offset, offset + length), filename, (error)=> {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(length)
                    }
                })
            }
        });
    }

    async close(handle) {
        return new Promise((resolve, reject)=>{
            if(! this.openedFiles[handle]) {
                reject(new Error('handle no exits'));
            }
            //this.openedFiles[handle].destroy();
            delete this.openedFiles[handle]
            delete this.openedFileBuffers[handle]
            resolve(true);
        })
    }

    async unlink(path) {
        return new Promise((resolve, reject)=>{
            this.ftp_client.delete(path, (error)=> {
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
            const stats = await this.stat(path);
            if(stats) {
                return true;
            }
        }catch(e) {

        }
        return false;
    }

    async syncRemoteToLocal(remote_path, local_file) {
        const local_path = path.join(os.tmpdir(), local_file)
        return new Promise((resolve, reject)=> {
            this.ftp_client.get(remote_path, (err, stream) => {
                if (err) {
                    reject(err);
                } else {
                    stream.once('close', ()=> {
                        resolve();
                    });
                    stream.once('error', (error)=> {
                        reject(error);
                    })
                    stream.pipe(fs.createWriteStream(local_path));
                }
                
            })
        })
    }

    async syncLocalToRemote(remote_path, local_file) {
        const local_path = path.join(os.tmpdir(), local_file)
        return new Promise((resolve, reject)=> {
            this.ftp_client.put(local_path, remote_path, (error)=> {
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
        // TODO: 断开连接
        for(var index in this.openedFiles) {
            this.close(index);
        }

        this.parent.closeConnection(this.connId);
        this.emit("dispose");
        this.removeAllListeners();
    }
}

module.exports = {
    FTPFileSystem
};
