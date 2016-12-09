/**
 * Figlet JS
 *
 * Copyright (c) 2010 Scott González
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://github.com/scottgonzalez/figlet-js
 */
let Font = require('./figlet-font');

let fontCache = {};

class Figlet {

	addFontObj(font) {
		fontCache[font.name] = font;
	}

	hasFont(name) {
		return fontCache[name];
	}

	addFontDef(name, fontDef) {
		this.addFontObj(new Font().parse(name, fontDef));
	}

	write(str, fontName) {
		let font = fontCache[fontName];
		return !font ? null : font.write(str);
	}
}

module.exports = Figlet;