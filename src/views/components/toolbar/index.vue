<template>
	<div v-if="visible" v-bind="$attrs" class="nx-toolbar">
		<el-input
			v-model="searchKeyWords"
			:placeholder="T('home.host-manager.search.placeholder')"
			class="nx-search-input"
			suffix-icon="el-icon-search"/>
		<Space :size="5">
			<el-tooltip class="item" effect="dark" content="新建分组" placement="top-start">
				<span class="host-tree-btn" @click="createFolder">
					<i class="el-icon-folder-add"/>
				</span>
			</el-tooltip>
			<el-tooltip class="item" effect="dark" content="新建会话" placement="top-start">
				<span class="host-tree-btn" @click="createSession">
					<i class="el-icon-circle-plus-outline"/>
				</span>
			</el-tooltip>
		</Space>
	</div>
</template>

<script>
import Space from '@/components/space'

export default {
	name: 'NxToolbar',
	components: {Space},
	props: {
		visible: false
	},
	data() {
		return {
			searchKeyWords: ''
		}
	},
	methods: {
		// 新建分组
		createFolder() {

		},
		// 新建会话
		createSession() {

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

		::v-deep .el-input__inner {
			background-color: var(--backgroundColor) !important;
			transition: all 2s ease-in;
			-webkit-transition: all 0.75s ease-in;

			&:focus {
				color: #fff;
				background-color: var(--btnPrimaryHoverBackgroundColor) !important;
			}
		}
	}

	.host-tree-btn {
		display: inline-block;
		box-sizing: border-box;
		text-align: center;
		padding: 5px;
		width: 32px;
		height: 32px;
		line-height: 22px;
		color: var(--primaryTextColor);
		border-radius: 4px;
		background-color: var(--btnPrimaryBackgroundColor);

		&:hover {
			cursor: pointer;
			background-color: var(--btnPrimaryHoverBackgroundColor);
		}
	}
}
</style>