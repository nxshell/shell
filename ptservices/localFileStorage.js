const {encrypt, decrypt} = require('../common/utils/encrypt');
const fs = require('fs');
const path = require('path');
const { createObjectHandle } = require("./nxobjs");

class FileStorage {
    constructor() {
    }

    async save(name, object) {
        let real_dir = path.dirname(name);
        try {
            fs.accessSync(real_dir, fs.constants.F_OK);
        } catch(e) {
            fs.mkdirSync(real_dir);
        }
        
        object = encrypt(JSON.stringify(object));
        fs.writeFileSync(name, JSON.stringify(object));
    }

    async read(name) {
        let rawVal = null;
        try {
            rawVal =  fs.readFileSync(name, {encoding: 'utf8'});
        } catch(e) {
            
        }
        if (!rawVal) {
            return null;
        }

        rawVal = decrypt(JSON.parse(rawVal));
        return JSON.parse(rawVal);
    }

    async export(src, dst) {
        fs.copyFileSync(src, dst);
        return true;
    }
    
    async import(src, dst) {
        fs.copyFileSync(src, dst);
        return true;
    }

    async path_exists(file_path) {
        if (fs.existsSync(file_path)) {
            return true;
        }
        return false;
    }
}


function createFileStorage() {
    const file_storage = new FileStorage();

    const handler = createObjectHandle(file_storage);

    return handler;
}

module.exports = {
    createFileStorage
};
