import { SFTPFileSystem } from "./sftp";
import { FTPFileSystem } from "./ftp";
import { WDFileSystem } from "./webdav";

export async function createFsInstance(sessionCfg) {
    const service = powertools.getService();
    let instId = await service.createFsInstance(sessionCfg);
    let newFS = null;
    if(sessionCfg.protocol === 'ftp') {
        newFS = new FTPFileSystem(instId);
    } else if(sessionCfg.protocol === 'webdav') {
        newFS = new WDFileSystem(instId);
    } else {
        newFS = new SFTPFileSystem(instId);
    }
    await newFS.init();
    return newFS;
}
