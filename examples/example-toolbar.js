let dialog = require('../lib');

let run = (cb) => {
	dialog({
		components: [
			new dialog.Components.ScreenToolbar([
				{hotkey: '1', title: 'Command 1', disabled: true},
				{hotkey: '2', title: 'Command 2', selected: true},
				{span: true},
				{hotkey: 'q', title: 'Quit', style: ['red']}
			])
		],
		border: true,
		footer: 'Type Hotkey or select & enter'
	}).then(item => {
		if (item) {
			console.log('Item choosen:', item);
		}
		cb();
	});
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
