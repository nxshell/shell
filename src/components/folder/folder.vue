<template>
	<div class="pt-file">
		<input type="text" style="display: none" />
		<slot>
			<pt-inputbox v-model="fileNames" />
			<pt-button type="primary" size="small" plain @click="openFolder">{{ T('Select') }}</pt-button>
		</slot>
	</div>
</template>

<script>
export default {
	name: 'PtFolder',
	props: {
		value: {
			type: String,
			default: ''
		}
	},

	data() {
		return {
			fileNames: this.value
		}
	},

	watch: {
		value(newVal) {
			if (newVal === this.fileNames) {
				return
			}
			this.fileNames = newVal
		},
		fileNames(newVal) {
			this.$emit('input', newVal)
		}
	},

	methods: {
		async openFolder() {
			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showOpenDialog({
				title: this.T('home.fileview.file-dialog.save-folder'),
				properties: ['openDirectory']
			})
			if (selectedFiles.canceled) {
				return
			}
			console.log('open folder ', selectedFiles.filePaths[0])
			this.fileNames = selectedFiles.filePaths[0]
			this.$emit('input', this.fileNames)
		}
	}
}
</script>

<style lang="scss">
.pt-file {
	position: relative;
	display: flex;
	justify-content: space-around;
	align-items: center;

	.pt-inputbox {
		flex-grow: 1;
	}

	.pt-button {
		flex-shrink: 1;
		width: 60px;
		min-width: 60px;
		height: 26px;
	}
}
</style>
