const path = require('path')
function resolve(dir = '') {
	return path.join(__dirname, './src', dir)
}
module.exports = {
    // publicPath: '.',
	configureWebpack: {
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.json']
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: {
						loader: 'ts-loader',
						options: {
							appendTsSuffixTo: [/\.vue$/],
							projectReferences: true
						}
					}
				},
				{
					test: /\.lazy\.scss.theme$/,
					use: [
						{
							loader: 'style-loader',
							options: {injectType: 'lazyStyleTag'}
						},
						'css-loader',
						'sass-loader'
					]
				}
			]
		}
	},
	chainWebpack: (config) => {
		// set svg-sprite-loader
		config.module.rule('svg').exclude.add(resolve('icons')).end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()
	}
}
