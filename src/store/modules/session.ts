import { TreeNode } from 'element-ui/types/tree'
import { defineStore } from 'pinia'
import { getCurrentInstance, onMounted, reactive, ref, VNode } from 'vue'

export interface IMenuNode {
    id: number
    uuid: string
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

export interface ITreeNode {
    sessionId: number | undefined
    protocol: string
    label: string
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
        sessionId: undefined,
        protocol: '',
        label: '',
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
     * 匹配查找
     *
     * @param name 菜单名称
     * @param keyword 关键词
     * @returns 是否找到
     */
    const matchFunction = (name: string, keyword?: string) => {
        if (keyword) {
            return new RegExp(keyword, 'i').test(name)
        }
        return true
    }

    /**
     * 将sessionConfig转化为菜单结构
     * 查找通用
     *
     * @param sessionConfigList 待转换的会话配置列表
     * @param treeList 菜单树列表
     * @param keyword 关键词
     */
    function process(sessionConfigList: any[], treeList: any[], keyword?: string) {
        for (const cfgNode of sessionConfigList) {
            const { _id: id, name, type, config, uuid } = cfgNode
            let treeNode: IMenuNode = {
                id: id,
                uuid,
                text: name,
                isFolder: cfgNode.type === 'folder',
                type: type,
                protocol: (config && config.protocal) ?? '',
                data: cfgNode.toJSONObject(false)
            }

            const children: IMenuNode[] = []
            if (treeNode.isFolder) {
                process(cfgNode.subSessions, children, keyword)
                treeNode.children = children
                if (!keyword) {
                    const groupItem = { value: id, label: name };
                    group.value.push(groupItem)
                }
            }
            if (matchFunction(name, keyword) || children.length > 0) {
                treeList.push(treeNode)
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
        // 清空数组
        menuTree.value.splice(0)
        process(sessionConfigs, menuTree.value, keyword)
    }

    /**
     * 更新当前选中的节点
     *
     * @param nodeElement menu ref 对象
     * @param node el-tree Node 节点数据
     * @param nodeData 会话配置数据
     */
    function updateCurrentNode(nodeElement: any, node?: TreeNode<string, IMenuNode>, nodeData?: IMenuNode) {
        currentNode.sessionId = nodeData?.id
        currentNode.protocol = nodeData?.protocol ?? ''
        currentNode.label = nodeData?.text ?? ''
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
        const { isFolder, node, sessionData } = currentNode
        if (!sessionData && !node) {
            sessionManager.addSessionConfig(null, sessionConfig)
        }
        if (isFolder) {
            sessionManager.addSessionConfig(sessionData?.data, sessionConfig)
        }
        updateProcess()
    }

    function updateSendToAllXterm(status: boolean) {
        keyboardToAll.value = status
    }

    onMounted(updateProcess)

    return {
        group,
        menuTree,
        currentNode,
        keyboardToAll,
        updateSendToAllXterm,
        updateProcess,
        appendSessionConfig,
        updateCurrentNode
    }
})
export default useSessionStore
