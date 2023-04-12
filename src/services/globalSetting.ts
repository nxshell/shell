import Storage from "./storage";

type GlobalCategoryType = "xterm" | "storage";

interface IProfile {
    [propName: string]: number | string | object | boolean | any[]
}

let globalCategory: {
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
        globalCategory = profile || {};
    } catch (e) {
        console.warn("read global setting failed", e);
    }

}

async function storeGlobalProfile(): Promise<void> {
    await Storage.saveSoftConfig(globalCategory);
    await Storage.save(GLOBAL_RPFILE, globalCategory, false);
}

export function getProfile(categoryName: GlobalCategoryType): IProfile | null {
    return globalCategory[categoryName] || null;
}

export async function setProfile(categoryName: GlobalCategoryType, profile: IProfile): Promise<void> {
    globalCategory[categoryName] = profile;
    // save profile
    await storeGlobalProfile();

    // Notify applications
}

export async function updateProfile(catagoryName: GlobalCategoryType, profile: IProfile): Promise<void> {
    let old = globalCategory[catagoryName] || {};
    for (const _k in profile) {
        if (profile.hasOwnProperty(_k)) {
            old[_k] = profile[_k]
        }
    }
    globalCategory[catagoryName] = old;
    // save profile
    await storeGlobalProfile();
}
