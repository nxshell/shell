import {Pti18n} from "../../../common/i18n";

const defaultLocale = navigator.language;

const i18nState = {
    state: {
        locale: "",
        langs: {},
        trans: {}
    },

    locale(locale, lang) {
        this.state.langs[locale] = lang
    },

    setLocale(locale) {
        if (!(locale in this.state.langs)) {
            locale = defaultLocale;
        }
        this.state.locale = locale;
        if (!this.state.trans[locale]) {
            this.state.trans[locale] = new Pti18n(locale, this.state.langs[locale] || {})
        }
    },
    get _T() {
        const i18nTrans = this.state.trans[this.state.locale];
        const empty = t => t
        return i18nTrans ? ((t, ...args) => {return i18nTrans._T(t, ...args)}) : empty
    }
};

export default i18nState;