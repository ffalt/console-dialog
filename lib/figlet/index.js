/**
 * Figlet JS node.js module
 *
 * Copyright (c) 2010 Scott González
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://github.com/scottgonzalez/figlet-js
 */

let fs = require('fs');
let path = require('path');
let Figlet = require('./figlet');
let FontDefs = require('./figlet-fonts');

class NodeFiglet extends Figlet {
	addFont(name) {
		let filename = path.join(__dirname, 'fonts', name + '.flf');
		if (fs.existsSync(filename)) {
			let data = fs.readFileSync(filename, 'utf-8');
			return this.addFontDef(name, data);
		} else {
			let fontDefs = new FontDefs(__dirname);
			fontDefs.load();
			let data = fontDefs.fonts[name];
			if (data)
				return this.addFontDef(name, data);
		}
	}
}

module.exports = NodeFiglet;
