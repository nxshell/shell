const { FStats } =require("./fstat");

class Dirent extends FStats {
    name = ""
    constructor(name, stat) {
        super(stat);
        this.name = name;
    }
}

exports.Dirent = Dirent;