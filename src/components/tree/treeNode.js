function isWraped(node) {
    return "_$ptTreeNode" in node;
}

const funcCache = Object.create(null);

export function getDataKeyFunc(key) {
    if (!key) {
        return () => ""
    }
    let readKey = funcCache[key];
    if (key && !readKey) {
        readKey = new Function(['value'], `return value.${ key };`);
        funcCache[key] = readKey;
    }
    return readKey;
}

export function processTreeNodes(treeData, autoExpanded = false, nodeStates = null, key = "") {
    if (!nodeStates) {
        nodeStates = Object.create(null);
    }

    let readKey = getDataKeyFunc(key);

    const process = (treeList) => {
        return treeList.map((value) => {
            if (isWraped(value)) {
                return value;
            }
            const stateKey = readKey(value);

            const stateValue = nodeStates[stateKey] || {
                expanded: false, selected: false
            };
            let wrapNode = {
                _$ptTreeNode: true, selected: stateValue.selected, data: value
            };

            if (value.children) {
                wrapNode.children = process(value.children);
                wrapNode.expanded = !!value.expanded || autoExpanded || stateValue.expanded;
            }

            return wrapNode;
        });
    };

    return process(treeData);
}
