import { getIconForFolder, getIconForFile } from "vscode-material-icon-theme-js";

/**
 * 根据名称获取系统名称
 *
 * @param system 待匹配的系统名称
 */
export function getSystemIcon(system: string) {
    const normalizeName = /^([a-zA-Z]+)/.exec(system);
    return normalizeName && normalizeName[0] || 'linux'
}

export function getFileIcon(name: string) {
    return (getIconForFile(name) || 'file').replace?.('.svg', '')
}

export function getFolderIcon(name: string) {
    return getIconForFolder(name).replace('.svg', '')
}