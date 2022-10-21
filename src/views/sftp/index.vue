<template>
	<div class="sftp-workspace">
		<pt-sftp-view
			v-for="(sessionId) in sessions"
			:key="sessionId"
			v-show="currentSessionId === sessionId"
			:sessionId="sessionId"
		/>
	</div>
</template>

<script>
import PtSftpView from "./sftpview";

export default {
	name: "SFTPWorkspace",
	components: {
		PtSftpView
	},
	data() {
		return {
			sessions: [],
			currentSessionId: -1
		}
	},
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
			if (this.sessions.findIndex(v => v === sessId) > -1) {
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
.sftp-workspace {
	position: relative;
	width: 100%;
	height: 100%;
}
</style>