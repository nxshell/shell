import { ref } from 'vue'

export default function initSystemFontList() {
	const fontList = ref<{ label: string; value: any }[]>([
		{
			label: 'home.profile.terminal.font-family.options.default',
			value: 'default'
		},
		{
			label: 'home.profile.terminal.font-family.options.lucida-console',
			value: 'Lucida Console'
		},
		{
			label: 'home.profile.terminal.font-family.options.consolas',
			value: 'Consolas'
		},
		{
			label: 'home.profile.terminal.font-family.options.fira-code',
			value: 'Fira Code'
		}
	])

	;(async () => {
		// @ts-ignore
		const service = powertools.getService()
		const systemFonts = await service.getSystemFonts()
		if (systemFonts) {
			fontList.value = ['default', ...systemFonts].map((f) => {
				if (f === 'default') {
					return {
						label: 'home.profile.terminal.font-family.options.default',
						value: f
					}
				}
				return {
					label: f,
					value: f
				}
			})
		}
	})()
	return { fontList }
}
