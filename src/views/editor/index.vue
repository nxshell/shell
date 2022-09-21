<template>
    <div class="vnc-workspace">
        <pt-editor-view v-for="(sessId) in sessions" :key="sessId"
            v-show="currentSessionId == sessId"
            :sessionId="sessId"
        ></pt-editor-view>
    </div>
</template>

<script>
import PtEditorView from "./editorview";

export default {
    name: "EditorWorkspace",
    components: {
        PtEditorView
    },
    data() {
        return {
            sessions: [],
            currentSessionId: -1
        }
    },

    created() {},

    beforeRouteUpdate(to, from, next) {
        if (to.path !== from.path) {
            let sessionId = parseInt(to.params.sessionId);
            this.currentSessionId = sessionId;
            this.addSession(sessionId);
        }
        next();
    },

    activated() {
        this.currentSessionId = parseInt(this.$route.params.sessionId);
        this.addSession(this.currentSessionId);
    },

    methods: {
        addSession(sessId) {
            if (this.sessions.findIndex(v => v == sessId) > -1) {
                return;
            }
            this.sessions.push(sessId);
        },
        removeSession(idx) {
            this.sessions.splice(idx, 1);
        }
    }
}
</script>

<style lang="scss">
.vnc-workspace {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>