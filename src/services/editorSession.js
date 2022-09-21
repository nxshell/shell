import { SESSION_TYPES, SessionInterface, registerSessionFactory } from "./session";
const { getGlobalId } = require("../../common/utils/idGenerator");

class SfpEditorSession extends SessionInterface {
    constructor(params) {
        super(params.name, SESSION_TYPES.EDITOR);
        this.cfg = params;
        this.sftp = params.config.sftp;
        this.remote_path = params.config.remote_path;
        this.ext_name = params.config.ext_name;
        this.local_file = "sfpeditor_" + getGlobalId();
    }

    async init() {
        await this.sftp.syncRemoteToLocal(this.remote_path, this.local_file);
    }

    async readFileContent() {
        return await this.sftp.readFileContent(this.local_file);
    }

    async writeFileContent(v) {
        return await this.sftp.writeFileContent(this.local_file, v);
    }

    async saveToRemote() {
        return await this.sftp.syncLocalToRemote(this.remote_path, this.local_file);
    }

}

async function createSftpEditorSession(params) {
    return new SfpEditorSession(params);
}

registerSessionFactory(SESSION_TYPES.EDITOR, createSftpEditorSession);
