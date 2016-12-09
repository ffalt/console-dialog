let dialog = require('../lib');

let run = (cb) => {
	dialog({
		components: [
			new dialog.Components.ScreenTableItems([
				{hotkey: 'a', title: 'Choice A', selected: true},
				{hotkey: 'b', title: 'Choice B'},
				{hotkey: 'c', title: 'Choice C'}
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