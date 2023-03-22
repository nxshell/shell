const { NxDataTransfer } = require("../common/nxsys/dataTransfer");
const { getNodeSessionInstanceByUUID } = require("./nodes");
const { createObjectHandle, getObject } = require("./nxobjs");
const WaitObject = require("../common/utils/waitObject");


class NxDataTransferServer extends NxDataTransfer {
    /** @type {import("../common/nxsys/dataTransfer").NxTransferDataDesc} */
    from = null;
    /** @type {import("../common/nxsys/dataTransfer").NxTransferDataDesc} */
    to = null;

    /** @type {WaitObject} */
    lastWaitObject = null;
    
    /** @type {import("../common/nxsys/dataTransfer").NxTransferAnswers} */
    answers = null;

    channel = null;
    
    constructor() {
        super();
        this.answers = {
            overwrite: {
                action : "ask",
                keep: false
            },
            merge: {
                action: "ask",
                keep: false
            }
        };

    }

    _setFrom(from) {
        this.from = from;
    }

    _setTo(to) {
        this.to = to;
    }

    _bindChannel(channelId) {
        this.channel = powertools.bindChannelByPeerId(channelId);
    }

    /**
     * 提交信息到客户端
     * @param {import("../common/nxsys/dataTransfer").NxTransferMessage} msg 
     */
    _emit(msg) {
        this.channel.send(msg);
    }

    /**
     * 遍历一个文件夹所有信息
     *  文件目录树（广度优先遍历）
     *      文件路径（相对路径，遍历的根路径）
     *      类型
     *  文件个数
     *  文件总大小
     * 
     * @param {import("path")} pathLib 对应的Path处理库
     * @param {import("../common/filesystem/filesystem".PtFileSystem)} fs 对应的文件系统支持
     * @param {String} rootDir 待遍历的根目录
     */
    async walkFolder(pathLib, fs, rootDir) {
        // 规范化目录名
        const rootPath = pathLib.normalize(rootDir);
        const files = [];
        let totalFileCount = 0;
        let totalFileSize = 0;

        const walk = async (relPath) => {
            const currentPath = pathLib.resolve(rootPath, relPath);
            const direntList = await fs.readdir(currentPath);
            for (let i = 0; i < direntList.length; i++) {
                /** @type {import("fs").Dirent} */
                const dirent = direntList[i];
                // FIXME: dirent.filename 和 NodeJS的dirent.name不一致
                const dirpath = pathLib.join(relPath, dirent.name);
                const folderList = [];
                let isFolder = false;
                /** @type {import("fs").Stats} */
                let stats = await fs.lstat(pathLib.resolve(rootPath, dirpath));
                if (dirent.isDirectory()) {
                    folderList.push(dirpath);
                    isFolder = true;
                }

                const fileSize = dirent.isDirectory() ? 0 : stats.size;
                totalFileSize += fileSize;
                totalFileCount++;
                files.push({
                    name: dirent.name,
                    path: dirpath,
                    size: fileSize,
                    type: dirent.isDirectory() ? "dir" : "file"
                });
                for (let j = 0; j < folderList.length; j++) {
                    await walk(folderList[j]);
                }
            }
        }

        await walk(".");

        return {
            files,
            totalFileSize,
            totalFileCount
        };
    }

    /**
     * 询问用户如果需要的话
     * 
     * @param {import("path")} sourcePathLib 源文件所处的节点对应的PathLib
     * @param {import("../common/filesystem/filesystem").PtFileSystem} sourceFS 源文件所使用的文件系统
     * @param {import("../common/filesystem/filesystem").PtFileSystem} destFS 目标文件所使用的文件系统
     * @param {String} sourcePath 源文件路径 
     * @param {String} destPath 目标路径
     * @returns {Promise.<Any>}
     */
    async askIfNeed(sourcePathLib, sourceFS, destFS, sourcePath, destPath) {
        const exist = await destFS.exists(destPath);
        if (!exist) {
            return null;
        }

        const sourceStat = await sourceFS.stat(sourcePath);
        const destStat = await destFS.stat(destPath);

        /* 源和目标的类型并不一致 */
        if ((sourceStat.isDirectory() && (!destStat.isDirectory())) || 
            ((!sourceStat.isDirectory()) && (destStat.isDirectory()))
        ) {
            this._emit({
                event: "error",
                args: {
                    message: "",
                    type: "exsits"
                }
            });
            throw new Error("file or directory exsits");
        }

        let question = sourceStat.isDirectory() ? "merge" : "overwrite";
        const basename = sourcePathLib.basename(sourcePath)

        const {action, keep} = await this._ask(question, {
            name: basename,
            dest: {
                lastModify: destStat.mtime,
                size: destStat.size
            },
            src: {
                lastModify: sourceStat.mtime,
                size: sourceStat.size
            }
        });

        // this.answers.merge.keep = keep;
        // this.answers.merge.action = action;

        return action;
    }

    /**
     * 复制文件
     * @param {import("path")} sourcePathLib 源文件所处的节点对应的PathLib
     * @param {import("path")} destPathLib 目标文件所处的对应的PathLib
     * @param {import("../common/filesystem/filesystem").PtFileSystem} sourceFS 源文件所使用的文件系统
     * @param {import("../common/filesystem/filesystem").PtFileSystem} destFS 目标文件所使用的文件系统
     * @param {String} sourcePath 源文件路径 
     * @param {String} destPath 目标路径
     * @param {Number} sourceSize 原文件大小
     * @param {Boolean} emitProgress 是否发射进度信息
     */
    async copyFile(sourceFS, destFS, sourcePath, destPath, sourceSize=0, emitProgress=false) {
        const BUFF_SIZE = 65536;
        const rwBuffer = Buffer.allocUnsafe(BUFF_SIZE);

        let totalWrite = 0;
        let srcFileHandle;
        let destFileHandle;

        try {
            srcFileHandle = await sourceFS.open(sourcePath, "r");
            destFileHandle = await destFS.open(destPath, "w");
            let rwOffset = 0;
            let that = this;
            let startDate = new Date();

            function send_speed() {
                if (! emitProgress) {
                    return;
                }
                let endDate   = new Date();
                let _seconds = (endDate.getTime() - startDate.getTime()) / 1000;
                let speed = that._speedHuman(totalWrite * 8 / _seconds, 2);
                that._emit({
                    event: "transferring",
                    args: {
                        progress: Math.round(totalWrite / sourceSize * 100),
                        speed: speed
                    }
                });
            }

            let loop = 0;
            while (true) {
                let {bytesRead} = await sourceFS.read(srcFileHandle, rwBuffer, 0, BUFF_SIZE, rwOffset);
                if (bytesRead) {
                    await destFS.write(destFileHandle, rwBuffer, 0, bytesRead, rwOffset);
                    rwOffset += bytesRead;
                }
                
                totalWrite += bytesRead;

                if(loop > 10) {
                    send_speed();
                    loop = 0;
                }
                loop += 1;

                if (bytesRead < BUFF_SIZE) {
                    break;
                }
            }

        } catch (err) {
            throw err;
        } finally {
            if (srcFileHandle) {
                await sourceFS.close(srcFileHandle);
            }
            if (destFileHandle) {
                await destFS.close(destFileHandle);
            }
        }
    }

    /**
     * 复制文件夹
     * @param {import("path")} sourcePathLib 源目录所处的节点对应的PathLib
     * @param {import("path")} destPathLib 目标文件所处的对应的PathLib
     * @param {import("../common/filesystem/filesystem").PtFileSystem} sourceFS 源文件所使用的文件系统
     * @param {import("../common/filesystem/filesystem").PtFileSystem} destFS 目标文件所使用的文件系统
     * @param {String} sourcePath 源目录路径 
     * @param {String} destPath 目标路径
     */
    async copyFolder(sourcePathLib, destPathLib, sourceFS, destFS, sourcePath, destPath) {
        const copyInfo = await this.walkFolder(sourcePathLib, sourceFS, sourcePath);

        let {files, totalFileCount, totalFileSize} = copyInfo;
        let copySize = 0;

        let remainder = totalFileCount;
        for (let i = 0; i < files.length; i++) {
            let fileInfo = files[i];
            let start_time = new Date().getTime();

            // 转换原文件路径到目标路径
            const replaceReg = sourcePathLib.sep == "\\" ? /\\/g : /\//g;
            const destRelPath = fileInfo.path.replace(replaceReg, destPathLib.sep);
            let destFilePath = destPathLib.resolve(destPath, destRelPath);
            if (fileInfo.type === "dir") {
                let action = await this.askIfNeed(sourcePathLib, sourceFS, destFS, sourcePath, destFilePath);
                if (action === "cancel") {
                    return;
                }

                if (destFilePath === destPathLib.normalize(destPath)) {
                    continue;
                }
                if (action !== "skip" && action !== "merge") {
                    await destFS.mkdir(destFilePath);
                }
            } else {
                let sourceDirPath = sourcePathLib.resolve(sourcePath, fileInfo.path);
                let action = await this.askIfNeed(sourcePathLib, sourceFS, destFS, sourceDirPath, destFilePath);
                if (action === "cancel") {
                    return;
                }

                if (action !== "skip") {
                    await this.copyFile(sourceFS, destFS, sourceDirPath, destFilePath, fileInfo.size, false);
                    copySize += fileInfo.size;
                }
            }
            remainder--;
            let end_time = new Date().getTime();
            let speed =this._speedHuman(fileInfo.size/(end_time - start_time)*1000, 2);

            this._emit({
                event: "transferring",
                args: { 
                    progress: Math.round(copySize / totalFileSize * 100),
                    remainder,
                    totalFileCount,
                    speed: speed
                }
            });
            // TODO: 终止copy任务
        }
    }

    _speedHuman(speed, precision) {
        if (!/^([-+])?|(\.\d+)(\d+(\.\d+)?|(\d+\.)|Infinity)$/.test(speed)) {
            return '-';
        }
        if (speed === 0) return '0';
        if (typeof precision === 'undefined') precision = 1;
        const units = ['b/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s', 'Pb/s'];
        const num = Math.floor(Math.log(speed) / Math.log(1000));
        const value = (speed / Math.pow(1000, Math.floor(num))).toFixed(precision);
        return `${value} ${units[num]}`;
    }

    async _ask(question, args) {
        const answer = this.answers[question];
        if (answer.action === "ask" || (!answer.keep) ) {
            this._emit({
                event: "ask",
                args: {
                    question,
                    args
                }
            });
            this.lastWaitObject = new WaitObject();

            const userAnswer = await this.lastWaitObject.wait();
            answer.action = userAnswer.action;
            answer.keep = userAnswer.keep;
        }
        return answer;
    }

    answer(action, keep) {
        this.lastWaitObject.resolve({
            action, keep
        });
    }

    startTransferring() {
        if (this.from === null) {
            throw new Error("Invalid data transfer: no source");
        }
        if (this.to === null) {
            throw new Error("Invalid data transfer: no dest");
        }

        let { nodeUUID: fromNodeUUID, path: fromPath , connId: fromConnId = -1, createFolder: sourceCreateFolder = false} = this.from;
        let { nodeUUID: toNodeUUID, path: toPath, type: toType , connId: toConnId = -1, createFolder: destCreateFolder = false} = this.to;

        const doTransfer = async () => {
            const fromNode = getNodeSessionInstanceByUUID(fromNodeUUID);
            const toNode = getNodeSessionInstanceByUUID(toNodeUUID);
            this._emit({
                event: "prepare"
            });

            const sourceFSHandle = await fromNode.getFSInstance(fromConnId);
            const sourceFS = getObject(sourceFSHandle);
            
            const destFSHandle = await toNode.getFSInstance(toConnId);
            const destFS = getObject(destFSHandle);

            try {
                await sourceFS.init();
                await destFS.init();
                /** @type {import("fs").Stats} */
                const stat = await sourceFS.stat(fromPath);

                // 上传或者下载的源是目录，那么我们就在目标中创建目录
                if (sourceCreateFolder) {
                    let basename = fromNode.getPathLib().basename(fromPath);
                    toPath = toNode.getPathLib().resolve(toPath, basename);
                    const exists = await destFS.exists(toPath);
                    if (!exists) {
                        await destFS.mkdir(toPath);
                    } else {
                        // 目标目录项存在
                        /** @type {import("fs").Stats} */
                        const destStat = await destFS.stat(toPath);
                        // 目录项不是文件夹，抱歉直接报错
                        if (!destStat.isDirectory()) {
                            this._emit({
                                event: "error",
                                args: {
                                    message: "",
                                    type: "exsits"
                                }
                            });
                            return;
                        }

                        // 目标目录项存在并且是文件，询问用户是否合并
                        const action = await this.askIfNeed(fromNode.getPathLib(), sourceFS, destFS, fromPath, toPath);

                        if (action === "cancel" || action === "skip") {
                            return;
                        }
                    }
                }

                // 下载的源是目录
                // if (destCreateFolder) {
                //     let basename = from
                // }
                
                if (stat.isDirectory()) {
                    await this.copyFolder(fromNode.getPathLib(),
                        toNode.getPathLib(),
                        sourceFS,
                        destFS,
                        fromPath,
                        toPath
                    );
                } else {
                    let fileName;
                    if (toType === "file") {
                        fileName = toPath;
                    } else {
                        const basename = fromNode.getPathLib().basename(fromPath);
                        fileName = toNode.getPathLib().resolve(toPath, basename);
                    }

                    const action = await this.askIfNeed(fromNode.getPathLib(), sourceFS, destFS, fromPath, fileName);
                    if (action == "cancel" || action == "skip") {
                        return;
                    }

                    await this.copyFile(
                        sourceFS,
                        destFS,
                        fromPath,
                        fileName,
                        stat.size,
                        true
                    );
                }
            } catch (err) {
                console.error(err);
                this._emit({
                    event: "error",
                    args: {
                        message: err.message
                    }
                })
            } finally {
                sourceFS.dispose();
                destFS.dispose();
                this._emit({
                    event: "finished"
                });
            }
        }

        doTransfer();
    }

    dispose() {}
}

function createDataTransfer() {
    const transfer = new NxDataTransferServer();

    const handler = createObjectHandle(transfer);

    return handler;
}

module.exports = {
    createDataTransfer
};
