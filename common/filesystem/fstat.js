
const S_IFMT   =  0xF000;
const S_IFSOCK =  0xC000;
const S_IFLNK  =  0xA000;
const S_IFREG  =  0x8000;
const S_IFBLK  =  0x6000;
const S_IFDIR  =  0x4000;
const S_IFCHR  =  0x2000;
const S_IFIFO  =  0x1000;
const S_ISUID  =  0x800;
const S_ISGID  =  0x400;
const S_ISVTX  =  0x200;
  
const S_ISLNK = (m) => (((m) & S_IFMT) == S_IFLNK)
const S_ISREG = (m) => (((m) & S_IFMT) == S_IFREG)
const S_ISDIR = (m) => (((m) & S_IFMT) == S_IFDIR)
const S_ISCHR = (m) => (((m) & S_IFMT) == S_IFCHR)
const S_ISBLK = (m) => (((m) & S_IFMT) == S_IFBLK)
const S_ISFIFO= (m) => (((m) & S_IFMT) == S_IFIFO)
const S_ISSOCK= (m) => (((m) & S_IFMT) == S_IFSOCK)

const S_IRWXU = 0x1C0;   /* mask for file owner permissions */  
const S_IRUSR = 0x100;   /* owner has read permission */  
const S_IWUSR = 0x80;   /* owner has write permission */  
const S_IXUSR = 0x40;   /* owner has execute permission */  

const S_IRWXG = 0x38;   /* mask for group permissions */  
const S_IRGRP = 0x20;   /* group has read permission */  
const S_IWGRP = 0x10;   /* group has write permission */  
const S_IXGRP = 0x8;   /* group has execute permission */  

const S_IRWXO = 0x7;   /* mask for permissions for others (not in group) */  
const S_IROTH = 0x4;   /* others have read permission */  
const S_IWOTH = 0x2;   /* others have write permission */  
const S_IXOTH = 0x1;   /* others have execute permission */  

const PERMS = [S_IRUSR, S_IWUSR, S_IXUSR, S_IRGRP, S_IWGRP, S_IXGRP, S_IROTH, S_IWOTH, S_IXOTH];
const PERMS_CHAR = ["r", "w", "x", "r", "w", "x", "r", "w", "x"]

class Stats {
    mode = 0;
    uid = 0;
    gid = 0;
    size = 0;
    atime = 0;
    mtime = 0;
}

class FStats {
    /**
     * @type {Stats}
     */
    stats = null;
    constructor(stats) {
        this.stats = stats;
    }

    isBlockDevice() {
        return S_ISBLK(this.stats.mode);
    }

    isCharacterDevice() {
        return S_ISCHR(this.stats.mode);
    }

    isDirectory() {
        return S_ISDIR(this.stats.mode);
    }

    isFIFO() {
        return S_ISFIFO(this.stats.mode);
    }

    isFile() {
        return S_ISREG(this.stats.mode);
    }

    isSocket() {
        return S_ISSOCK(this.stats.mode);
    }

    isSymbolicLink() {
        return S_ISLNK(this.stats.mode);
    }

    getUid() {
        return this.stats.uid;
    }

    getGid() {
        return this.stats.gid;
    }

    getSize() {
        return this.stats.size;
    }

    getATime() {
        return this.stats.atime;
    }

    getMTime() {
        return this.stats.mtime;
    }

    get mtime() {
        return this.getMTime();
    }

    getPermsString() {
        const perms = PERMS.map((mask, idx) => {
            if (mask & this.stats.mode) {
                return PERMS_CHAR[idx];
            } else {
                return "-";
            }
        });
        let d = "-";
        if (this.isDirectory()) {
            d = 'd';
        }

        return `${d}${perms.join("")}`;
    }

    getPermsHex() {
        let hexStr = this.stats.mode.toString(8);
        return hexStr.slice(-3, hexStr.length + 1); 
    }
}

exports.FStats = FStats;