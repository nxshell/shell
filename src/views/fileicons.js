import apk from "../assets/fileicons/apk.png";
import folderConfig from "../assets/fileicons/folder-config.png";
import log from "../assets/fileicons/log.png";
import ppt from "../assets/fileicons/ppt.png";
import video from "../assets/fileicons/video.png";
import archive from "../assets/fileicons/archive.png";
import font from "../assets/fileicons/font.png";
import java from "../assets/fileicons/java.png";
import markdown from "../assets/fileicons/markdown.png";
import py from "../assets/fileicons/py.png";
import word from "../assets/fileicons/word.png";
import audio from "../assets/fileicons/audio.png";
import git from "../assets/fileicons/git.png";
import js from "../assets/fileicons/js.png";
import pdf from "../assets/fileicons/pdf.png";
import sh from "../assets/fileicons/sh.png";
import xls from "../assets/fileicons/xls.png";
import docker from "../assets/fileicons/docker.png";
import html from "../assets/fileicons/html.png";
import json from "../assets/fileicons/json.png";
import pem from "../assets/fileicons/pem.png";
import sql from "../assets/fileicons/sql.png";
import yaml from "../assets/fileicons/yaml.png";
import exe from "../assets/fileicons/exe.png";
import ignore from "../assets/fileicons/ignore.png";
import jsx from "../assets/fileicons/jsx.png";
import php from "../assets/fileicons/php.png";
import txt from "../assets/fileicons/txt.png";
import folder from "../assets/fileicons/folder.png";
import image from "../assets/fileicons/image.png";
import key from "../assets/fileicons/key.png";
import pkg from "../assets/fileicons/pkg.png";
import golang from "../assets/fileicons/golang.png"
import unknown from "../assets/fileicons/unknown.png";
import c from "../assets/fileicons/c.png";
import cmake from "../assets/fileicons/cmake.png";
import cpp from "../assets/fileicons/cpp.png";
import csharp from "../assets/fileicons/csharp.png";
import cap from "../assets/fileicons/cap.png";
import css from "../assets/fileicons/css.png";
import dll from "../assets/fileicons/dll.png";
import dmg from "../assets/fileicons/dmg.png";
import h from "../assets/fileicons/h.png";
import hpp from "../assets/fileicons/hpp.png";
import ini from "../assets/fileicons/ini.png";
import iso from "../assets/fileicons/iso.png";
import vue from "../assets/fileicons/vue.png";
import folderLink from "../assets/fileicons/folder-link.png";
import fileLink from "../assets/fileicons/file-link.png";

import path from "path";

const iconMapper = {
    ".apk": apk,
    
    ".c": c,
    "cmakelist.txt": cmake,
    ".cpp": cpp,
    ".cs": csharp,
    ".cap": cap,
    ".css": css,
    ".less": css,
    ".scss": css,
    ".sass": css,
    ".dll": dll,
    ".dmg": dmg,
    ".h": h,
    ".hpp": hpp,
    ".ini": ini,

    ".img": iso,
    ".iso": iso,
    
    ".log": log,
    
    ".ppt": ppt,
    ".pptx": ppt,
    ".ppt": ppt,

    ".wav": audio,
    ".flac": audio,
    ".mp3": audio,
    ".mid": audio,
    ".ogg": audio,
    ".m3u": audio,
    ".mpa": audio,
    ".ape": audio,
    ".aac": audio,
    ".wma": audio,
    ".amr": audio,

    ".zip": archive,
    ".rar": archive,
    ".tar": archive,
    ".7z": archive,
    ".lzma": archive,
    ".gz": archive,
    ".bz": archive,
    ".cab": archive,
    ".xz": archive,

    ".ttf": font,
    ".ttc": font,
    ".otf": font,
    ".fon": font,
    ".eot": font,
    ".font": font,

    ".java": java,
    ".jar": java,
    ".war": java,
    ".class": java,
    
    ".md": markdown,

    ".py": py,
    ".pyc": py,
    ".egg": py,

    ".doc": word,
    ".docx": word,
    ".docm": word,
    ".wps": word,
    ".rtf": word,

    ".avi": video,
    ".mp4": video,
    ".mpg": video,
    ".mpeg": video,
    ".mkv": video,
    ".wmv": video,
    ".rmvb": video,
    ".mov": video,
    ".3gp": video,
    ".flv": video,
    ".f4v": video,

    ".git": git,
    ".js": js,
    ".mjs": js,
    ".pdf": pdf,
    ".sh": sh,
    ".tch": sh,
    
    ".xls": xls,
    ".xlsx": xls,
    ".xlsm": xls,
    ".et": xls,

    "dockerfile": docker,

    ".html": html,
    ".htm": html,
    ".json": json,
    ".pem": pem,
    ".sql": sql,
    ".yml": yaml,
    ".yaml": yaml,
    ".exe": exe,
    ".gitignore": ignore,
    // "": ignore,
    ".jsx": jsx,
    ".php": php,
    ".txt": txt,

    ".bmp": image,
    ".jpg": image,
    ".jpeg": image,
    ".pixmap": image,
    ".tiff": image,
    ".tif": image,
    ".png": image,
    ".heic": image,
    ".heif": image,
    ".ico": image,
    ".gif": image,
    ".psd": image,
    ".ai": image,

    ".go": golang,

    ".key": key,
    
    ".rpm": pkg,
    ".deb": pkg,
    ".msi": pkg,
    ".msix": pkg,

    ".vue": vue,

    unknown
}

/**
 * 获取文件对应的图标
 * 
 * @param {String} fileName 文件名
 * @return {String}
 */
export function getFileIcon(fileName) {
    const extName = path.extname(fileName);
    if (extName == '') {
        return iconMapper[fileName.toLowerCase()] || iconMapper.unknown;
    }

    return iconMapper[extName.toLowerCase()] || iconMapper.unknown;
}

export function getFileExtName(fileName) {
    return path.extname(fileName);
}

/**
 * 获取文件夹显示图标
 * 对于特殊目录/etc或者/dev显示特殊文件夹图标
 * 
 * @param {String} folderPath 文件夹路径
 * @return {String}
 */
export function getFolderIcon(folderPath) {
    if (folderPath === "/dev" || folderPath === "/etc") {
        return folderConfig;
    }

    return folder;
}

export function getFolderLinkIcon(folderPath) {
    return folderLink;
}

export function getFileLinkIcon(folderPath) {
    return fileLink;
}