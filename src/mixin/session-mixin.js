import { mapMutations, mapState } from 'vuex'

export const sessionMixin = {
    computed: {
        ...mapState(['theme'])
    },
    mounted() {
        this.setTheme(this.$store.getters.theme)
    },
    methods: {
        ...mapMutations(['setTheme']),
    }
}