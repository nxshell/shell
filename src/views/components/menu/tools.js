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
                text: cfgNode.name, data: cfgNode.toJSONObject(false)
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