const fontList = require('font-list')

let systemFonts = null;
async function getSystemFonts() {
    if(systemFonts) {
        return systemFonts;
    }
    try {
        systemFonts = await fontList.getFonts({ disableQuoting: true });
    } catch(e) {
        systemFonts = null;
    }
    return systemFonts;
}

module.exports = {
    getSystemFonts
}