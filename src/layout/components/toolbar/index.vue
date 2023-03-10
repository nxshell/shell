<template>
	<div v-bind="$attrs" class="nx-toolbar">
		<el-input
			v-model="searchKeywords"
			:placeholder="$t('home.host-manager.search.placeholder')"
			class="nx-search-input"
			clearable
			suffix-icon="el-icon-search"
		/>
		<n-space :size="5">
			<el-tooltip class="item" effect="dark" :content="$t('home.sessions-context-menu.create-folder')" placement="top-start">
				<span class="host-tree-btn" @click.prevent="handleCreateFolder">
					<i class="el-icon-folder-add" />
				</span>
			</el-tooltip>
			<el-tooltip class="item" effect="dark" :content="$t('home.sessions-context-menu.create-session')" placement="top-start">
				<span class="host-tree-btn" @click.prevent="gotoCreateShellSession">
					<i class="el-icon-circle-plus-outline" />
				</span>
			</el-tooltip>
		</n-space>
	</div>
</template>

<script>
import * as EventBus from '@/services/eventbus'

export default {
	name: 'NxToolbar',
	data() {
		return {
			searchKeywords: '',
		}
	},
	watch: {
		searchKeywords() {
			setTimeout(() => {
				EventBus.publish('nx-menu-search', this.searchKeywords)
			}, 200)
		}
	},
	methods: {
		async gotoCreateShellSession() {
			EventBus.publish('create-session-toolbar', {})
		},
		handleCreateFolder() {
			EventBus.publish('create-session-folder', {})
		},
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
</style>
