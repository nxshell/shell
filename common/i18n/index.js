/**
 * Simple i18n implemented
 */

const options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
};

class Pti18n {
    locale = ""
    lang = {}
    timeFormat = t => t
    numberFormat = n => n
    constructor(locale = "en-US", lang = {}) {
        this.locale = locale;
        this.lang = lang;
        this.timeFormat = new Intl.DateTimeFormat(locale, options);
        this.numberFormat = new Intl.NumberFormat(locale);
    }

    _T(key, ...args) {
        const keyPaths = key.trim().split(".");
        let value = this.lang;
        for (let nodeKey of keyPaths) {
            value = value[nodeKey];
            if (value === undefined) {
                break;
            }
        }
        if (value === undefined) {
            return key;
        }

        if (typeof value != "string") {
            value = value.toLocalString(this.locale);
        }

        return value.replace(/\$(\d{1,2})/g, (m, i) => {
            let param = args[i]
            if (typeof param == "string") {
                return param;
            } else if (typeof param === "number") {
                return this.numberFormat.format(param);
            } else if (param instanceof Date) {
                return this.timeFormat.format(param);
            } else if (!param) {
                return ""
            } else {
                return param.toLocalString(this.locale);
            }
        })
    }
}

module.exports = {
    Pti18n
};
