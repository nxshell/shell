import { defineStore } from 'pinia'

const useSessionStore = defineStore('session', {
    state: () => ({
        keyboardToAll: false
    }),
    getters: {},
    actions: {}
})
export default useSessionStore