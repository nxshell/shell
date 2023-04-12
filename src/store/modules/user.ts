import { defineStore } from 'pinia'

export interface IUser {
    avatar: string
    userName: string
}

export const useUserStore = defineStore('user', {
    state: (): IUser => ({
        avatar: '',
        userName: ''
    }),
    getters: {},
    actions: {}
})
