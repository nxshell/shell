export default {
    methods: {
        broadcast(evtName, ...args) {
            for (let child of this.$children) {
                child.$emit.apply(child, [evtName, ...args]);
            }
        }
    }
}