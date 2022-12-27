import { getSessionIcon, getSystemIcon } from '@/views/sysicons'
import { getFolderIcon, getFileIconBySuffix } from '@/views/fileicons'
import mousetrap from 'mousetrap'

/**
 * 激活会话Tab
 */
export async function activeSession(sessInst) {
    if (!sessInst) {
        return
    }
    const router = sessInst.router
    if (router.path === this.$route.path) {
        return
    }
    await this.$router.push({ path: router.path })
    const activeSessionIndex = this.$store.getters.sessionInstTabs.findIndex((inst) => {
        return inst.data.id === sessInst.id
    })
    await this.$store.dispatch('updateActiveTabIndex', activeSessionIndex)
    sessInst.active()
}

/**
 * 处理Session会话实例激活
 *
 * @return 会话实例数据
 */
export async function handleSessionInstActive(index) {
    const sessTabItem = this.sessionInstTabs[index]
    await this.$store.dispatch('updateActiveTabIndex', index)
    if (!sessTabItem) {
        return
    }
    await this.activeSession(sessTabItem.data)
}

/**
 * 更新会话实例Tabs
 *
 * @return {Promise<void>}
 */
export async function updateSessionInstTabs() {
    const instList = this.$sessionManager.getSessionIntances()
    const sessionTabs = instList.map((inst) => {
        const item = {
            icon: {
                iconName: 'setting',
                type: 'svg'
            },
            title: inst.name,
            data: inst
        }
        switch (inst.type) {
            case 'shell':
                item.icon = {
                    iconName: getSystemIcon(inst.cfg.osType),
                    type: 'img'
                }
                if (inst.name === '') {
                    item.title = inst.cfg.hostAddress
                }
                break
            case 'welcome':
                item.icon = {
                    iconName: getSessionIcon(inst.type),
                    type: 'img'
                }
                break
            case 'login':
                item.icon = {
                    iconName: 'user',
                    type: 'svg'
                }
                break
            case 'sftp':
                item.icon = {
                    iconName: getFolderIcon(''),
                    type: 'img'
                }
                if (inst.name === '') {
                    item.title = inst.cfg.hostAddress
                }
                break
            case 'editor':
                item.icon = {
                    iconName: getFileIconBySuffix(inst.ext_name),
                    type: 'img'
                }
                if (inst.name === '') {
                    item.title = inst.cfg.hostAddress
                }
                break
            case 'vnc':
                item.icon = {
                    iconName: getSessionIcon(inst.type),
                    type: 'img'
                }
                break
            default:
        }
        // FIXME: 此处有隐患，实例移除时需要移除掉监听
        // inst.on("update-name", () => {
        //     item.title = inst.name;
        // });
        return item
    })
    await this.$store.dispatch('updateSessionInstanceTabs', sessionTabs)
}

export function setupBarShortCut() {
    mousetrap.bind('alt+1', (e) => {
        this.handleSessionInstActive(0)
    })
    mousetrap.bind('alt+2', (e) => {
        this.handleSessionInstActive(1)
    })
    mousetrap.bind('alt+3', (e) => {
        this.handleSessionInstActive(2)
    })
    mousetrap.bind('alt+4', (e) => {
        this.handleSessionInstActive(3)
    })
    mousetrap.bind('alt+5', (e) => {
        this.handleSessionInstActive(4)
    })
    mousetrap.bind('alt+6', (e) => {
        this.handleSessionInstActive(5)
    })
    mousetrap.bind('alt+7', (e) => {
        this.handleSessionInstActive(6)
    })
    mousetrap.bind('alt+8', (e) => {
        this.handleSessionInstActive(7)
    })
    mousetrap.bind('alt+9', (e) => {
        this.handleSessionInstActive(8)
    })
}
