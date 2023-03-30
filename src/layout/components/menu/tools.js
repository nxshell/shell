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
                id: cfgNode._id, text: cfgNode.name, isFolder: false, data: cfgNode.toJSONObject(false)
            }

            const children = []
            if (cfgNode.type === SESSION_CONFIG_TYPE.FOLDER) {
                walkAndProcess(children, cfgNode.subSessions)
                treeNode.isFolder = true
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
export async function handleSessionTreeContextMenu_Connect() {
    console.log('打开链接', this.currentNode)
    await this.handleHostOpen(this.currentNode.sessionData.data)
}

/**
 * 剪切板操作
 */
export function treeOpClipboardCut(node) {
    this.treeOpClipboard.data = node
    this.treeOpClipboard.operate = 'cut'
}

/**
 * 粘贴
 * @param node
 */
export function treeOpClipboardCopy(node) {
    this.treeOpClipboard.data = node
    this.treeOpClipboard.operate = 'copy'
}

/**
 * 添加配置
 * @param {SessionConfig} sessionConfig 会话配置
 */
export function addSessionConfig(sessionConfig) {
    const menuData = this.processSessionConfigTree([sessionConfig])[0]
    const { data, node, treeNode } = this.currentSelectedSessionNode
    if (!data && !node && treeNode) {
        this.$sessionManager.addSessionConfig(null, sessionConfig)
        treeNode.append(menuData, null)
        this.updateSessionTree()
        return
    }
    if (node.data.isFolder) {
        treeNode.append(menuData, node)
        this.$sessionManager.addSessionConfig(data.data, sessionConfig)
        this.updateSessionTree()
        return
    }
}

export function handleOpenSFTP(data) {
    this.$sessionManager.createSFTPSessionInstance(data)
}

export function handleSessionTreeContextMenu_SFTP() {
    this.$sessionManager.createSFTPSessionInstance(this.currentNode.sessionData.data)
}

// 重命名会话文件夹
export function handleSessionTreeContextMenu_RenameFolder() {
    const folderName = this.currentSelectedSessionNode.data.data.name
    this.isEdit = true
    this.$refs.folderDialogRef?.show(folderName)
}

/**
 * 导出配置文件
 *
 * @returns 导出的配置文件
 */
export async function handleSessionTreeContextMenu_SaveConfig() {
    const coreService = powertools.getService('powertools-core')
    const selectedFiles = await coreService.showSaveDialog({
        properties: ['openFile']
    })

    if (selectedFiles.canceled) {
        return
    }

    const filePath = selectedFiles.filePath
    try {
        await this.$sessionManager.exportConfig(filePath)
    } catch (e) {
        console.log('export config error ', e)
    }
}

/**
 * 导入配置文件
 *
 */
export async function handleSessionTreeContextMenu_ImportConfig() {
    const coreService = powertools.getService('powertools-core')
    const selectedFiles = await coreService.showOpenDialog({
        properties: ['openFile']
    })

    if (selectedFiles.canceled) {
        return
    }

    const filePath = selectedFiles.filePaths[0]
    try {
        await this.$sessionManager.importConfig(filePath)
        this.updateSessionTree()
    } catch (e) {
        console.log('import config error ', e)
    }
}
