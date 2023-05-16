import { defineStore } from 'pinia'
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { subscript } from '@/services/eventbus'
import router from '@/router'
import { getFileIcon, getFolderIcon, getSystemIcon } from '@/icons/system-icon'

import { getProfile, updateProfile } from '@/services/globalSetting'

export interface INxTabProps {
	id: number | -1
	title: string
	icon: string
	iconType: 'img' | 'svg'
	sessionType: string
	session: any
}

const useNxTabsStore = defineStore('nxTabs', () => {
	const tabData = ref<INxTabProps[]>([])
	const currentActive = ref<number>(0)
	const checkedTabType = ref('')
	const showTabs = ref(true)
	const configPanel = ref(true)
	const noConfirm = ref(false)
	const editorChange = ref(false)
	const proxy = getCurrentInstance()?.proxy
	// @ts-ignore
	const sessionManager = proxy?.$sessionManager

	const tabIcon: Record<string, string> = {
		login: 'user',
		welcome: 'logo',
		sftp: 'folder-sftp-open',
		globalsetting: 'n-setting'
	}

	/**
	 * 监听并更新Tab数据
	 */
	function updateTabInstance() {
		const instances = sessionManager.getSessionIntances()
		tabData.value = instances.map((x: Record<string, any>) => {
			const { id, type, name, cfg, ext_name } = x
			const tabInstance: INxTabProps = {
				id,
				sessionType: type,
				title: name === '' ? cfg.hostAddress : name,
				session: x,
				iconType: 'svg',
				icon: tabIcon[type] || type
			}
			if (type === 'shell' || type === 'sftp' || type === 'editor') {
				tabInstance.title = name === '' ? cfg.hostAddress : name
				tabInstance.icon =
					type === 'shell'
						? getSystemIcon(cfg.system ?? 'linux')
						: type === 'editor'
						? getFileIcon(ext_name)
						: tabInstance.icon
			}
			return tabInstance
		})
	}

	/**
	 * 更新当前激活的Tab签编号
	 *
	 * @param tabIndex 当前tab编号
	 */
	function updateActiveTabIndex(tabIndex: number) {
		let index = tabIndex
		if (currentActive.value === tabIndex) {
			index = currentActive.value - 1
			index = currentActive.value > 0 ? currentActive.value : 0
		}
		currentActive.value = index
	}

	async function activateSessionByInstance(sessionInstance: any) {
		if (!sessionInstance) {
			return
		}
		const { id, path } = sessionInstance
		// @ts-ignore
		if (path === proxy.$route.path) {
			return
		}
		await router.push({ path: sessionInstance.router.path })
		const activeSessionIndex = tabData.value.findIndex((inst) => inst.id === id)
		updateActiveTabIndex(activeSessionIndex)
		sessionInstance.active()
	}

	/**
	 * 根据选中的菜单高亮匹配的tab
	 *
	 * @param index 当前选中的Tab编号
	 */
	async function activateSession(index: number) {
		const instance = tabData.value[index]
		if (!instance) {
			return
		}
		await activateSessionByInstance(instance.session)
	}

	/**
	 * 更新关闭会话交互
	 *
	 * @param value true | false
	 */
	function updateNoConfirm(value: boolean) {
		const defaultSettings = getProfile('xterm')
		updateProfile('xterm', { ...defaultSettings, noCloseConfirm: value }).then(() => (noConfirm.value = value))
	}

	function updateEditChange(status: boolean) {
		editorChange.value = status
	}

	onMounted(() => {
		// 关闭会话是否需要确认
		noConfirm.value = (getProfile('xterm')?.noCloseConfirm as boolean) || false
		subscript('instance-created', async (sessionInstance: any) => {
			updateTabInstance()
			await activateSessionByInstance(sessionInstance)
		})
		subscript('instance-destroyed', async () => {
			updateTabInstance()
			if (tabData.value.length <= 0) {
				sessionManager.createWelcomeSessionInstance()
			} else {
				if (currentActive.value >= tabData.value.length) {
					updateActiveTabIndex(tabData.value.length - 1)
				}
				await activateSession(currentActive.value)
			}
		})
	})

	onUnmounted(() => {})
	return {
		tabData,
		showTabs,
		configPanel,
		checkedTabType,
		currentActive,
		noConfirm,
		editorChange,
		updateEditChange,
		activateSession,
		activateSessionByInstance,
		updateNoConfirm,
		updateActiveTabIndex
	}
})

export default useNxTabsStore
