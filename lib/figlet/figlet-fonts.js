let fs = require('fs');
let path = require('path');
let zlib = require('zlib');

class FontDefs {

	constructor(datapath) {
		this.archive_filename = 'figlet-fonts.json.gz';
		this.datapath = datapath;
		this.fonts = {};
	}

	load() {
		let zipped = fs.readFileSync(path.join(this.datapath, this.archive_filename));
		let data = zlib.gunzipSync(zipped);
		this.fonts = JSON.parse(data.toString());
	}

	save() {
		let zipped = zlib.gzipSync(JSON.stringify(this.fonts), {level: 9});
		fs.writeFileSync(path.join(this.datapath, this.archive_filename), zipped);
	}

	loadFolder() {
		this.fonts = {};
		let dir = path.join(this.datapath, 'fonts');
		let files = fs.readdirSync(dir);
		for (let i = 0; i < files.length; i++) {
			let filename = path.join(dir, files[i]);
			let stat = fs.lstatSync(filename);
			if (!stat.isDirectory() && path.extname(files[i]) === '.flf') {
				let name = files[i].replace(/.flf/g, '');
				this.fonts[name] = fs.readFileSync(filename, 'utf-8');
			}
		}
	}

	saveFolder() {
		let dir = path.join(this.datapath, 'fonts');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		Object.keys(this.fonts).forEach(key => {
			fs.writeFileSync(path.join(dir, key + '.flf'), this.fonts[key]);
		});
	}

	names() {
		return Object.keys(this.fonts);
	}

}

module.exports = FontDefs;
