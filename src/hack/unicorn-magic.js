// https://github.com/sindresorhus/unicorn-magic/blob/6614e1e82a19f41d7cc8f04df7c90a4dfe781741/node.js

export function toPath(path) {
  return path;
}

export function traversePathUp(startPath) {
	return {
		* [Symbol.iterator]() {
			let currentPath = path.resolve(toPath(startPath));
			let previousPath;

			while (previousPath !== currentPath) {
				yield currentPath;
				previousPath = currentPath;
				currentPath = path.resolve(currentPath, '..');
			}
		},
	};
}
