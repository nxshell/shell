module.exports = {
	multipass: true, // boolean. false by default
	js2svg: {
		indent: 2, // string with spaces or number of spaces. 4 by default
		pretty: false // boolean, false by default
	},
	plugins: [
		{
			name: "sortAttrs",
			params: {
				xmlnsOrder: "alphabetical"
			}
		},
		{
			name: "removeAttrs",
			params: {
				attrs: ["class", "t", "p-id"]
			}
		},
		{
			name: "removeEmptyText",
			params: true
		},
		{
			name: "removeComments",
			params: true
		},
		{
			name: "removeDoctype",
			params: true
		}
	]
}
