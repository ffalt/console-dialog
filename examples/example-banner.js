let dialog = require('../lib');

let run = (cb) => {
	dialog({
		components: [
			new dialog.Components.ScreenBanner('Demo', 'banner'),
			new dialog.Components.ScreenToolbar([
				{span: true}, {hotkey: 'q', title: 'Close', style: ['red']}
			])
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