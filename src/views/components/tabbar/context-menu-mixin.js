export const contextMenuMixin = {
    data() {
        return {
            sessionTabContextMenu: {
                shell: [
                    {
                        label: 'home.sessions-context-menu.duplicate',
                        type: 'normal',
                        // accelerator: "ctrl+insert",
                        handler: this.handleCopy
                    },
                    {
                        label: 'home.sessions-context-menu.close',
                        type: 'normal',
                        // accelerator: "ctrl+insert",
                        handler: this.handleClose
                    },
                    {
                        label: 'home.sessions-context-menu.close-right',
                        type: 'normal',
                        handler: this.handleCloseRight
                    },
                    {
                        label: 'home.sessions-context-menu.close-other',
                        type: 'normal',
                        handler: this.handleCloseOther
                    },
                    {
                        label: 'home.sessions-context-menu.close-left',
                        type: 'normal',
                        handler: this.handleCloseLeft
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'home.sessions-context-menu.prop',
                        type: 'normal',
                        handler: this.handleProp
                    }
                ],
                welcome: [
                    // {
                    //     label: 'home.sessions-context-menu.close',
                    //     type: 'normal',
                    //     handler: this.handleClose
                    // }
                ],
                setting: [
                    {
                        label: 'home.sessions-context-menu.close',
                        type: 'normal',
                        handler: this.handleClose
                    }
                ],
                login: [
                    {
                        label: 'home.sessions-context-menu.close',
                        type: 'normal',
                        handler: this.handleClose
                    }
                ],
                unknown: [
                    {
                        label: 'home.sessions-context-menu.close',
                        type: 'normal',
                        handler: this.handleClose
                    },
                    {
                        label: 'home.sessions-context-menu.close-left',
                        type: 'normal',
                        handler: this.handleCloseLeft
                    },
                    {
                        label: 'home.sessions-context-menu.close-right',
                        type: 'normal',
                        handler: this.handleCloseRight
                    },
                    {
                        label: 'home.sessions-context-menu.close-other',
                        type: 'normal',
                        handler: this.handleCloseOther
                    }
                ]
            },
        }
    },
    methods: {
        async handleCopy() {
            let sessTabItem = this.sessionInstTabs[this.sessionContextMenuTabIndex]
            let session = sessTabItem.data
            await this.$sessionManager.duplicateSessionInstance(session)
        },
        async handleCloseLeft() {
            let index = this.sessionContextMenuTabIndex - 1
            if (index < 0) {
                return
            }
            let session_close = []
            for (let i = 0; i <= index; ++i) {
                session_close.push(this.sessionInstTabs[i])
            }

            session_close.forEach((item) => {
                let session = item.data
                session.close()
            })
        },
        async handleCloseRight() {
            let len = this.sessionInstTabs.length
            let index = this.sessionContextMenuTabIndex + 1
            if (index > len - 1) {
                return
            }

            let session_close = []
            for (let i = index; i < len; ++i) {
                session_close.push(this.sessionInstTabs[i])
            }

            session_close.forEach((item) => {
                let session = item.data
                session.close()
            })
        },
        async handleCloseOther() {
            let len = this.sessionInstTabs.length
            let session_close = []
            for (let i = 0; i < len; ++i) {
                if (i !== this.sessionContextMenuTabIndex) {
                    session_close.push(this.sessionInstTabs[i])
                }
            }

            session_close.forEach((item) => {
                let session = item.data
                session.close()
            })
        },
        async handleProp() {
            const sessTabItem = this.sessionInstTabs[this.sessionContextMenuTabIndex]
            const sessionInstance = sessTabItem.data
            const sessionConfig = this.$sessionManager.getSessionConfigByInstanceId(sessionInstance.getId())
            await this.$sessionManager.createShellSettingSessionInstance(sessionConfig)
        },
    }
}