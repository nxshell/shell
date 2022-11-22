//import LocalWebStorage from "./localWebStorage";
import LocalFileStorage from "./localFileSystem";

class Storage {
    _localStorageProvider = null;
    storageProviders = {};

    constructor() {
        this._localStorageProvider = new LocalFileStorage();
        this.storageProviders[this._localStorageProvider.name] = this._localStorageProvider;
    }

    get localStorage() {
        return this._localStorageProvider;
    }

    get providerList() {
        return Object.keys(this.storageProviders).map((key) => this.storageProviders[key])
    }

    async initialize() {
        // TODO: add code here
        // 读取远程存储的配置
        // 初始化远程配置
    }

    /**
     * 同步本地数据到远程
     * @param {String} name 同步的数据名称
     */
    async syncToRemote(name) {
        // TODO:
    }

    /**
     * 同步远程配置到本地
     * @param {String} name 同步的数据名称
     */
    async syncToLocal(name) {
        // TODO:
    }

    async setConfigPath(path) {
        return await this.localStorage.setConfigPath(path);
    }

    async save(name, object, sync = false) {
        const ls = this.localStorage;
        await ls.save(name, object)
        if (sync) {
            await this.syncToRemote(name);
        }
    }

    async read(name) {
        return await this.localStorage.read(name)
    }

    async saveSoftConfig(object, sync = false) {
        const ls = this.localStorage;
        await ls.saveSoftConfig(object)
    }

    async readSoftConfig() {
        return await this.localStorage.readSoftConfig()
    }

    async export(src, dst) {
        return await this.localStorage.export(src, dst)
    }

    async import(src, dst) {
        return await this.localStorage.import(src, dst);
    }
}

const storage = new Storage();

export default storage;
