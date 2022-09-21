export default class StorageProviderInterface {
    providerName = "";
    constructor(name) {
        this.providerName = name;
    }

    save(name, object) {
        throw new Error("Save function not implemented");
    }
    read(name) {
        throw new Error("Read function not implemented");
    }

    configure(config) {}
}
