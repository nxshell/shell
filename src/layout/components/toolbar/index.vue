<template>
	<div v-bind="$attrs" class="nx-toolbar">
		<el-input v-model="searchKeywords" :placeholder="$t('home.host-manager.search.placeholder')" class="nx-search-input" clearable suffix-icon="el-icon-search" />
		<n-space :size="5">
			<el-tooltip class="item" effect="dark" :content="$t('home.sessions-context-menu.create-folder')" placement="top-start">
				<span class="host-tree-btn" @click.prevent="handleCreateFolder">
					<i class="el-icon-folder-add" />
				</span>
			</el-tooltip>
			<el-tooltip class="item" effect="dark" :content="$t('home.sessions-context-menu.create-session')" placement="top-start">
				<el-popover v-model="visible" placement="top-start">
					<span slot="reference" class="host-tree-btn">
						<i class="el-icon-circle-plus-outline" />
					</span>
					<ul class="n-session-mode" @click.prevent="gotoCreateShellSession">
						<li class="n-session-mode__item" data-type="ssh">
							<n-icon name="ssh" />
							SSH
						</li>
						<li class="n-session-mode__item" data-type="ftp">
							<n-icon name="s-ftp" />
							FTP
						</li>
						<li class="n-session-mode__item" data-type="telnet">
							<n-icon name="telnet" />
							Telnet
						</li>
						<li class="n-session-mode__item" data-type="serial">
							<n-icon name="serial" />
							Serial
						</li>
						<li class="n-session-mode__item" data-type="vnc">
							<n-icon name="vnc" />
							Vnc
						</li>
						<li class="n-session-mode__item" data-type="localShell">
							<n-icon name="powershell" />
							LocalShell
						</li>
					</ul>
				</el-popover>
			</el-tooltip>
		</n-space>
	</div>
</template>

<script>
import { publish } from "@/services/eventbus"

export default {
	name: "NxToolbar",
	data() {
		return {
			searchKeywords: "",
			visible: false
		}
	},
	watch: {
		searchKeywords() {
			setTimeout(() => {
				publish("nx-menu-search", this.searchKeywords)
			}, 200)
		}
	},
	methods: {
		async gotoCreateShellSession(e) {
			const type = e.target.dataset.type || "ssh" // default to ssh if none specified.
			this.visible = false
			publish("create-session-toolbar", type)
		},
		handleCreateFolder() {
			publish("create-session-folder")
		}
	}
}
</script>

<style lang="scss" scoped>
.nx-toolbar {
	display: flex;
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	padding: 0 5px;
	-webkit-app-region: no-drag;

	.nx-search-input {
		width: 213px;
		margin-right: 5px;
		transition: background-color 0.3s var(--n-bezier);
	}

	.host-tree-btn {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 5px;
		width: 32px;
		height: 32px;
		line-height: 22px;
		border-radius: 2px;
		color: var(--n-button-primary-text);
		background-color: var(--n-button-primary);

		i {
			font-size: 16px;
		}

		&:hover {
			cursor: pointer;
			background-color: var(--n-button-primary-hover);
		}
	}
}

.n-session-mode {
	padding: 10px 5px;
	background-color: var(--n-select-bg-color);

	&__item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		column-gap: 10px;
		padding: 5px 10px;
		color: var(--n-text-color-light);

		&:hover {
			cursor: pointer;
			border-radius: 4px;
			background-color: var(--n-select-hover-bg-color);
		}
	}
}
</style>
