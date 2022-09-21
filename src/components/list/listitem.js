import Vue from "vue";

export default Vue.component("pt-list-item", {
    data() {
        return {};
    },
    props: {
        itemRender: Function,
        item: Object
    },

    methods: {
        selectItem() {
            this.$emit("select");
        },
        handleContextMenu(e) {
            e.preventDefault();
            this.$emit("contextmenu");
        }
    },

    render(createElement) {
        const itemRender = this.itemRender || (() => {});
        return createElement("li", {
            "class": {
                "pt-list-item": true,
                "selected": this.item.selected
            },
            on: {
                click: this.selectItem,
                contextmenu: this.handleContextMenu
            }
        }, [
            itemRender({
                item: this.item
            })
        ]);
    }
});
