let dialog = require('../lib');

let run = (cb) => {
	dialog({
		components: [
			new dialog.Components.ScreenTextLine('Insert Text', ['bold']),
			new dialog.Components.ScreenEditor({
				title: 'Insert Text:',
				text: 'editable text',
				hotkey: 'n',
				style: ['bold']
			})
		],
		border: true
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