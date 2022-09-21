import i18nState from "./i18n";

export default {
    data() {
        return {
            i18nState
        }
    },
    computed: {
        T() {
            return (t, ...args) => {
                return this.i18nState._T(t, ...args);
            }
        }
    },

    created() {
        
    },

    methods: {
        locale(locale, langPack) {
            this.i18nState.locale(locale, langPack);
        },
        setLocale(locale) {
            this.i18nState.setLocale(locale);
        }
    }
}

export function locale(locale, langPack) {
    i18nState.locale(locale, langPack);
}

export function setLocal(locale) {
    i18nState.setLocale(locale);
}
