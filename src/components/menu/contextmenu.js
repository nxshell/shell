import Vue from "vue";

import "./contextmenu.scss";

const PtContextMenu = Vue.extend({
    data() {
        return {
            menuData: [],
            sourceEvent: null,
            selfRect: {
                left: 0,
                top: 0,
                right: 0,
                height: 0
            },
            visibility: false
        };
    },

    computed: {
        left() {
            let left = this.sourceEvent.x;
            if (left + this.selfRect.width > window.innerWidth) {
                left -= this.selfRect.width;
            }
            return left;
        },

        top() {
            let top = this.sourceEvent.y;
            if (top + this.selfRect.height > window.innerHeight) {
                top -= this.selfRect.height;
            }
            return top;
        }
    },

    mounted() {
        this.$nextTick(() => {
            this.getRect();
            this.visibility = true;
        });
    },

    beforeDestroy() {
        this.$el.remove()
    },

    methods: {
        getRect() {
            if (!this.$el) {
                return { left: 0, top: 0, right: 0, height: 0 };
            }
            const rect = this.$el.getBoundingClientRect();
            this.selfRect = {
                left: rect.left, top: rect.top, width: rect.width, height: rect.height
            };
        }, handlePopStack() {
            this.$destroy();
        }
    },

    render(h) {
        const menu = h("pt-menu", {
            props: {
                menu: this.menuData,
                translate: true
            }, on: {
                "pop-stack": this.handlePopStack
            }
        });
        return h("div", {
            'class': {
                'context-menu': true
            }, style: {
                left: this.left + 'px', top: this.top + 'px',
            }
        }, [menu])
    }
});

export function showContextMenu(menu, evt) {
    // 没有内容禁止打开
    if (!menu || menu.length === 0) {
        return
    }
    const contextMenuNode = document.createElement("div");
    document.body.appendChild(contextMenuNode)
    new PtContextMenu({
        data: {
            menuData: menu,
            sourceEvent: evt
        }
    }).$mount(contextMenuNode);
}

export default {
    install() {
        Object.defineProperty(Vue.prototype, "$showContextMenu", {
            get() {
                return showContextMenu;
            }
        })
    }
}