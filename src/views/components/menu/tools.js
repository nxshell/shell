import { SESSION_CONFIG_TYPE } from '@/services/sessionMgr'

/**
 * 处理会话配置树
 */
export function processSessionConfigTree(sessionConfigs, searchKeywords) {
    const sessionConfigTree = sessionConfigs
    let matchFunc = (name) => true
    if (searchKeywords) {
        let reg = new RegExp(searchKeywords, 'i')
        matchFunc = (name) => reg.test(name)
    }

    const walkAndProcess = (parent, cfgNodes) => {
        for (const cfgNode of cfgNodes) {
            let treeNode = {
                text: cfgNode.name,
                data: cfgNode.toJSONObject(false)
            }

            let children = []
            if (cfgNode.type === SESSION_CONFIG_TYPE.FOLDER) {
                walkAndProcess(children, cfgNode.subSessions)
                treeNode.children = children
            }
            if (matchFunc(cfgNode.name) || children.length > 0) {
                parent.push(treeNode)
            }
        }
    }
    let treeRoot = []
    walkAndProcess(treeRoot, sessionConfigTree)
    return treeRoot
}

/**
 * 右键打开链接
 */
export function handleSessionTreeContextMenu_Connect() {
    this.handleHostOpen(this.currentSelectedSessionNode)
}

/**
 * 剪切板操作
 */
export function treeOpClipboardCut(node) {
    this.treeOpClipboard.data = node
    this.treeOpClipboard.operate = 'cut'
    console.log('剪切板', this.treeOpClipboard)
}

/**
 * 粘贴
 * @param node
 */
export function treeOpClipboardCopy(node) {
    this.treeOpClipboard.data = node
    this.treeOpClipboard.operate = 'copy'
    console.log('剪切板', this.treeOpClipboard)
}

/**
 * 添加配置
 * @param {SessionConfig} sessCfg 会话配置
 */
export function addSessionConfig(sessCfg) {
    const menuData = this.processSessionConfigTree([sessCfg])[0]
    if (!this.currentSelectedSessionNode) {
        this.$sessionManager.addSessionConfig(null, sessCfg)
        this.$refs.sessionTree.appendNode({ treeData: menuData })
        this.updateSessionTree()
        return
    }
    let { data, node } = this.currentSelectedSessionNode
    if (node.isFolder) {
        debugger
        node.appendChild(menuData)
        this.$sessionManager.addSessionConfig(data.data, sessCfg)
        this.updateSessionTree()
        return
    }
    // 需要判断节点是不是根目录下的节点
    node = node.getParentNode()
    if (!node) {
        this.$refs.sessionTree.appendNode({ treeData: menuData })
        this.$sessionManager.addSessionConfig(null, sessCfg)
        this.updateSessionTree()
    } else {
        let { data } = node.nodeData
        node.appendSibling(menuData)
        this.$sessionManager.addSessionConfig(data.data, sessCfg)
    }
    this.updateSessionTree()
}

export function handleOpenSFTP(data) {
    this.$sessionManager.createSFTPSessionInstance(data)
}

export function handleSessionTreeContextMenu_SFTP() {
    const { data: { data } } = this.currentSelectedSessionNode
    this.$sessionManager.createSFTPSessionInstance(data)
}

// 重命名会话文件夹
export function handleSessionTreeContextMenu_RenameFolder() {
    const folderName = this.currentSelectedSessionNode.data.data.name
    this.isEdit = true
    this.$refs.folderDialogRef.show(folderName)
}

