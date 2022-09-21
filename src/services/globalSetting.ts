import Storage from "./storage";

type GlobalCatagoryType = "xterm" | "storage";

interface IProfile {
    [propName: string]: number | string | object | any[] 
}

let globalCatagory: {
    xterm?: IProfile,
    storage?: IProfile
} = {};

const GLOBAL_RPFILE = "__GLOBAL_PROFILE__"

export async function loadGlobalProfile(): Promise<void> {
    try {
        const profile = await Storage.read(GLOBAL_RPFILE);
        const softConfig = await Storage.readSoftConfig();
        if (softConfig) {
            profile["xterm"]["nxconfig"] = softConfig.xterm.nxconfig;
        }
        globalCatagory = profile || {};
    } catch (e) {
        console.warn("read global setting failed", e);
    }
    
}

async function storeGlobalProfile(): Promise<void> {
    await Storage.saveSoftConfig(globalCatagory);
    await Storage.save(GLOBAL_RPFILE, globalCatagory, false);
}

export function getProfile(catagoryName: GlobalCatagoryType): IProfile | null {
    return globalCatagory[catagoryName] || null;
}

export async function setProfile(catagoryName: GlobalCatagoryType, profile: IProfile): Promise<void> {
    globalCatagory[catagoryName] = profile;
    // save profile
    await storeGlobalProfile();

    // Notify applications
}
