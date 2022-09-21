/**
 * 本地WebStorage
 * 使用LocalStorage进行配置的存储
 * 默认基础存储，所有需要存储的数据均在此处进行保存
 */
import StorageProviderInterface from "./storageInterface";

const STORAGE_ITEM = "__PT_LOCAL_STORAGE__"

class LocalWebStorage extends StorageProviderInterface {
    constructor() {
        super("PtLocalWebStorage");
    }
    async save(name, object) {
        localStorage.setItem(STORAGE_ITEM + name, JSON.stringify(object));
    }

    async read(name) {
        const rawVal = localStorage.getItem(STORAGE_ITEM + name);
        if (!rawVal) {
            return null;
        }

        return JSON.parse(rawVal);
    }
}

export default LocalWebStorage;
