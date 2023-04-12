import { getIconForFolder, getIconForFile } from "vscode-material-icon-theme-js";

interface ISystemProps {
    keywords: string[],
    icon: string
}

const systems: ISystemProps[] = [
    { icon: 'windows', keywords: ['windows'] },
    { icon: 'linux', keywords: ['linux'] },
    { icon: 'arch', keywords: ['arch', 'linux'] },
    { icon: 'centos', keywords: ['fedora', 'linux'] },
    { icon: 'debian', keywords: ['debian', 'linux'] },
    { icon: 'deepin', keywords: ['deepin', 'linux'] },
    { icon: 'kali', keywords: ['kali', 'linux'] },
    { icon: 'redhat', keywords: ['redhat', 'linux'] },
    { icon: 'suse', keywords: ['suse', 'linux'] },
    { icon: 'ubuntu', keywords: ['ubuntu', 'linux'] },
    { icon: 'oracle', keywords: ['oracle'] },
    { icon: 'open-euler', keywords: ['open-euler', 'linux'] },
    { icon: 'fedora', keywords: ['fedora', 'linux'] },
    { icon: 'vnc', keywords: ['vnc'] },
    { icon: 'ubuntu-kylin', keywords: ['kylin', 'ubuntu', 'linux'] },
]

export function querySearch(keyword: string, callback: Function): void {
    const results = keyword ? systems.filter(x => x.keywords.includes(keyword.toLowerCase())) : systems
    callback(results)
}

/**
 * 根据名称获取系统名称
 *
 * @param system 待匹配的系统名称
 */
export function getSystemIcon(system: string) {
    const normalizeName = /^([a-zA-Z]+)/.exec(system);
    return normalizeName && normalizeName[0] || 'linux'
}

export function getIcon(name: string, type: 'file' | 'folder' | 'link' | undefined) {
    switch (type) {
        case 'file':
            return getFileIcon(name)
        case 'folder':
            return getFolderIcon(name)
        case 'link':
            return ['bin', 'sbin', 'lib', 'lib64'].includes(name) ? 'folder-link' : 'file-link'
        default:
            return 'unknown'
    }
}

export function getFileIcon(name: string) {
    return (getIconForFile(name) || 'file').replace?.('.svg', '')
}

export function getFolderIcon(name: string) {
    return getIconForFolder(name).replace('.svg', '')
}