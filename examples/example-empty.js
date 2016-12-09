let dialog = require('../lib');

let run = (cb) => {
	dialog({
		clear: true,
		footer: 'Empty Screen, press Ctrl-C or Escape to close'
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