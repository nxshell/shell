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
                    {
                        label: 'home.sessions-context-menu.close',
                        type: 'normal',
                        handler: this.handleClose
                    }
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
    }
}