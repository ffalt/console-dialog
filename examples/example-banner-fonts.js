let dialog = require('../lib');
let FontDefs = require('../lib/figlet/figlet-fonts');
let Figlet = require('../lib/figlet/figlet');
let path = require('path');

let run = (cb) => {
	let fontdefs = new FontDefs(path.resolve(path.join(__dirname, '../lib/figlet')));
	fontdefs.load();
	let items = fontdefs.names().map(name => {
		return {title: name};
	});
	let figlet = new Figlet();

	let executer = new dialog.ScreenExecuter();

	let display = () => {
		if (!figlet.hasFont(banner.font)) {
			let fontdef = fontdefs.fonts[banner.font];
			if (fontdef) {
				figlet.addFontDef(banner.font, fontdef);
			}
		}
		executer.execute(menu).then(item => {
			if (!item) {
				cb();
			} else if (item.data && item.data.click) {
				item.data.click();
			} else if (item.id === 'editor') {
				banner.text = item.text;
				banner.selected = true;
				table.all.forEach(it => {
					it.selected = false;
				});
				menu.rebuild();
				display();
			} else if (item.title) {
				banner.font = item.title;
				banner.selected = false;
				table.all.forEach(it => {
					it.selected = it === item;
				});
				menu.rebuild();
				display();
			} else {
				display();
			}
		});
	};

	let table = new dialog.Components.ScreenTableItems(items);
	let banner = new dialog.Components.ScreenBanner('Demo', 'banner');
	let options = {
		components: [
			new dialog.Components.ScreenTextLine('Choose Banner'),
			new dialog.Components.ScreenEditor({
				title: 'Demo Text:',
				text: 'Demo',
				hotkey: 't',
				id: 'editor',
				style: ['bold']
			}),
			table,
			new dialog.Components.ScreenTableItemTools(table),
			banner,
			new dialog.Components.ScreenToolbar([
				{
					hotkey: 'q',
					title: 'Quit',
					data: {
						click: cb
					}
				}
			])
		],
		border: true,
		clear: true,
		mouse: true
	};

	let menu = new dialog.Screen(options);

	display();
};


module.exports = run;
if (require.main === module) {
	if (!dialog.consoleSupported) {
		console.error('Interactive shell needed, this console is not supported');
	} else {
		run(() => {
			process.exit();
		})
	}
}