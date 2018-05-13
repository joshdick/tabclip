/* eslint-env node */

const path = require('path')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

const zipPluginConfig = {
	exclude: ['.DS_Store'],
	filename: 'tabclip.zip',
	// yazl Options
	// OPTIONAL: see https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
	fileOptions: {
		mtime: new Date(),
		mode: 0o100664,
	}
}

module.exports = {
	mode: 'production',
	entry: {
		fonts: './src/fonts.js',
		main: './src/main.js',
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new CopyWebpackPlugin(['manifest*.json', '*.htm', 'img/*png' ], { context: 'src' }),
		new ZipPlugin(zipPluginConfig)
	]
}
