export declare interface Storage {
    save(name: string, object: object | any[],  sync: boolean): Promise<void>;
    saveSoftConfig(object: object | any[]): Promise<void>;
    read(name: string): Promise<object|any>;
    readSoftConfig(): Promise<object|any>;
    setConfigPath(path: string): Promise<void>;
}

declare const storage: Storage;

export default storage;