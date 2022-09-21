/**
 * 本地文件
 * 使用LocalStorage进行配置的存储
 * 默认基础存储，所有需要存储的数据均在此处进行保存
 */
import StorageProviderInterface from "./storageInterface";
const path = require('path');

const STORAGE_ITEM = "__PT_LOCAL_STORAGE__"

const getAppDataDirty = ()=> {
    let portable = powertools.getPortable();
    let app_path = null;
    if(portable) {
        app_path = path.join(path.dirname(powertools.getAppPath()), ".nxconfig");
    } else {
        app_path = powertools.getAppDataDirty();
    }
    return path.normalize(app_path);
};

const getSoftwareConfig = ()=> {
    let s = path.normalize(path.join(powertools.getAppHomeDirty(), ".nxsoftconfig"));
    return s;
};

class LocalFileStorage extends StorageProviderInterface {
    constructor() {
        super("PtLocalFileStorage");
        this.service = powertools.getService();
        this.handler = null;
        this.file_path = "";
    }
    
    async _init() {
        this.handler = await this.service.createFileStorage();
        this.nxsoftconfig = await this.readSoftConfig();
    }

    async setConfigPath(file_path) {
        let result = await this.service.callObject(this.handler, 'path_exists', file_path);
        if (result) {
            this.file_path = file_path;
        }
    }

    getAppDataDirty() {
        if (this.file_path === "") {
            return getAppDataDirty()
        } else {
            return this.file_path;
        }
    }

    async saveSoftConfig(object) {
        if(! this.handler) {
            await this._init();
        }
        await this.service.callObject(this.handler, 'save', path.join(getSoftwareConfig(), "nxsoft.config"), JSON.stringify(object));
    }

    async save(name, object) {
        if(! this.handler) {
            await this._init();
        }
        await this.service.callObject(this.handler, 'save', path.join(this.getAppDataDirty(), STORAGE_ITEM + name), JSON.stringify(object));
    }

    async readSoftConfig() {
        if(! this.handler) {
            await this._init();
        }
        const rawVal = await this.service.callObject(this.handler, "read", path.join(getSoftwareConfig(), "nxsoft.config"));
        if (!rawVal) {
            return null;
        }

        return JSON.parse(rawVal);
    }

    async read(name) {
        if(! this.handler) {
            await this._init();
        }
        const rawVal = await this.service.callObject(this.handler, "read", path.join(this.getAppDataDirty(), STORAGE_ITEM + name));
        if (!rawVal) {
            return null;
        }

        return JSON.parse(rawVal);
    }

    async export(src, dst) {
        if(! this.handler) {
            await this._init();
        }
        return await this.service.callObject(this.handler, 'export', path.join(this.getAppDataDirty(), STORAGE_ITEM + src), dst);
    }

    async import(src, dst) {
        if(! this.handler) {
            await this._init();
        }
        return await this.service.callObject(this.handler, 'import', src, path.join(this.getAppDataDirty(), STORAGE_ITEM + dst));
    }
}

export default LocalFileStorage;
