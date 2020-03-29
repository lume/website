import {generateImportMapForProjectPackage} from '@jsenv/node-module-import-map'
import path from 'path'

generateImportMapForProjectPackage({
	projectDirectoryUrl:
		'file://' +
		process
			.cwd()
			.split(path.sep)
			.join('/'),
	includeDevDependencies: false,
	importMapFile: true,
	importMapFileRelativeUrl: './importMap.json',
})
