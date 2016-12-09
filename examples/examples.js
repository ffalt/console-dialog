#!/usr/bin/env node

let dialog = require('../lib');

let examples = {
	Empty: require('./example-empty'),
	Editor: require('./example-editor'),
	Choice: require('./example-choice'),
	Menu: require('./example-menu'),
	Banner: require('./example-banner'),
	BannerFonts: require('./example-banner-fonts')
};

let mainMenu = () => {
	dialog({
		components: [
			new dialog.Components.ScreenTextLine('Menu of Examples', ['bold']),
			new dialog.Components.ScreenTableItems(Object.keys(examples).map((key, i) => {
				return {hotkey: i + 1, title: key, selected: i === 0, icon: '☆'};
			})),
			new dialog.Components.ScreenToolbar([
				{
					hotkey: 'q',
					title: 'Quit'
				}
			])
		],
		border: true,
		footer: 'Type Hotkey or select & enter'
	}).then(item => {
		if (!item || (item.hotkey === 'q')) {
			console.log('Bye bye');
		} else {
			examples[item.title](() => {
				mainMenu();
			});
		}
	});
};

if (!dialog.consoleSupported) {
	console.error('Interactive shell needed, this console is not supported');
} else {
	mainMenu();
}
