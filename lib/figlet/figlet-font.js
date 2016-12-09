/**
 * Figlet JS
 *
 * Copyright (c) 2010 Scott González
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://github.com/scottgonzalez/figlet-js
 */

class Font {
	parse(name, defn) {
		const lines = defn.split('\n'),
			header = lines[0].split(' '),
			hardblank = header[0].charAt(header[0].length - 1),
			height = +header[1],
			comments = +header[5];
		this.name = name;
		this.defn = lines.slice(comments + 1);
		this.hardblank = hardblank;
		this.height = height;
		this.char = {};
		return this;
	}

	getChar(char) {
		if (char in this.char) {
			return this.char[char];
		}

		let
			charDefn = [],
			start = (char - 32) * this.height;
		for (let i = 0; i < this.height; i++) {
			charDefn[i] = this.defn[start + i]
				.replace(/@/g, '')
				.replace(new RegExp('\\' + this.hardblank, 'g'), ' ');
		}
		this.char[char] = charDefn;
		return charDefn;
	}

	write(str) {
		let chars = [],
			result = '',
			len = str.length;
		for (let i = 0; i < len; i++) {
			chars[i] = this.getChar(str.charCodeAt(i));
		}
		for (let height = chars[0].length, i = 0; i < height; i++) {
			for (let j = 0; j < len; j++) {
				result += chars[j][i];
			}
			result += '\n';
		}
		return result;
	}

}

module.exports = Font;