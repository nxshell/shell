// 登录认证方式
export type loginType = 'password' | 'key' | 'keyboard'

export interface IAuth {
    uname?: string
    password?: string
    privateKey?: string
    privateKeyPassword?: string
}

export interface ISSHProps {
    name: string
    group: string
    host: string
    system: string
    port: number
    auth: IAuth
}