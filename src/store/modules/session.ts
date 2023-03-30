import { TreeNode } from 'element-ui/types/tree'
import { defineStore } from 'pinia'
import { getCurrentInstance, onMounted, reactive, ref, VNode } from 'vue'

export interface IMenuNode {
	id: number
	text: string
	isFolder: boolean
	type: string
	protocol: string
	data: Record<string, any>
	children?: IMenuNode[]
}
interface IGroupProps {
	value: number
	label: string
}
export interface ISessionProps {
	group: IGroupProps[]
	menuTree: IMenuNode[]
}
export interface ITreeNode {
	isFolder: boolean
	node: TreeNode<string, IMenuNode> | undefined
	sessionData: Record<string, any> | undefined
	nodeElement: any
}
const useSessionStore = defineStore('session', () => {
	const group = ref<IGroupProps[]>([])
	const menuTree = ref<IMenuNode[]>([])
	const search = ref<boolean>(false)
	const currentNode = reactive<ITreeNode>({
		isFolder: false,
		node: undefined,
		sessionData: undefined,
		nodeElement: undefined
	})

	const keyboardToAll = ref(false)

	const proxy = getCurrentInstance()?.proxy
	// @ts-ignore
	const sessionManager = proxy?.$sessionManager

	/**
	 * 将会话配置转化为菜单配置
	 *
	 * @param sessionConfig 待转化的会话配置
	 * @returns 菜单配置
	 */
	const convertMenu = (sessionConfig: Record<string, any>): IMenuNode => {
		const { _id: id, name, type, config } = sessionConfig
		return {
			id: id,
			text: name,
			isFolder: false,
			type: type,
			protocol: (config && config.protocal) ?? '',
			data: sessionConfig.toJSONObject(false)
		}
	}

	/**
	 * 匹配查找
	 *
	 * @param name 菜单名称
	 * @param keyword 关键词
	 * @returns 是否找到
	 */
	const matchFunction = (name: string, keyword?: string) => new RegExp(keyword ?? '', 'i').test(name)

	/**
	 * 将sessionConfig转化为菜单结构
	 * 查找通用
	 *
	 * @param sessionConfigList 待转换的会话配置列表
	 * @param keyword 关键词
	 */
	function process(sessionConfigList: any[], keyword?: string) {
		for (const cfgNode of sessionConfigList) {
			const { _id: id, name, type, config } = cfgNode
			const isExist = menuTree.value.find((x) => x.id === id)
			if (!isExist) {
				let treeNode: IMenuNode = {
					id: id,
					text: name,
					isFolder: false,
					type: type,
					protocol: (config && config.protocal) ?? '',
					data: cfgNode.toJSONObject(false)
				}

				const children: IMenuNode[] = []
				if (cfgNode.type === 'folder') {
					process(children, cfgNode.subSessions)
					treeNode.isFolder = true
					treeNode.children = children
					!keyword && group.value.push({ value: id, label: name })
				}
				if (matchFunction(name, keyword) || children.length > 0) {
					menuTree.value.push(treeNode)
				}
			}
		}
	}

	/**
	 * 更新菜单
	 *
	 * @param keyword 关键词
	 */
	function updateProcess(keyword?: string) {
		if (keyword) {
			search.value = true
			menuTree.value.splice(0, menuTree.value.length)
		}
		const sessionConfigs = sessionManager.getSessionConfigs()
		console.log('会话内容', sessionConfigs)
		process(sessionConfigs, keyword)
	}

	/**
	 * 更新当前选中的节点
	 *
	 * @param nodeElement menu ref 对象
	 * @param node el-tree Node 节点数据
	 * @param nodeData 会话配置数据
	 */
	function updateCurrentNode(nodeElement: any, node?: TreeNode<string, IMenuNode>, nodeData?: IMenuNode) {
		currentNode.nodeElement = nodeElement
		currentNode.node = node
		currentNode.sessionData = nodeData
		currentNode.isFolder = nodeData?.isFolder ?? false
	}

	/**
	 * 添加新的菜单选项
	 *
	 * @param sessionConfig 会话内容
	 */
	function appendSessionConfig(sessionConfig: Record<string, any>) {
		const { isFolder, node, sessionData, nodeElement } = currentNode
		if (nodeElement) {
			if (!sessionData && !node) {
				sessionManager.addSessionConfig(null, sessionConfig)
			}
			if (isFolder) {
				sessionManager.addSessionConfig(sessionData, sessionConfig)
			}
			updateProcess()
		}
	}

	onMounted(updateProcess)

	return { group, menuTree, currentNode, keyboardToAll, updateProcess, appendSessionConfig, updateCurrentNode }
})
export default useSessionStore
