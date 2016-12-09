let dialog = require('../lib');

let run = (cb) => {
	dialog({
		components: [
			new dialog.Components.ScreenTextLine('Header of a full featured menu', ['bold']),
			new dialog.Components.ScreenEditor({
				title: 'Insert Text:',
				text: 'editable text',
				hotkey: 'n',
				style: ['bold']
			}),
			new dialog.Components.ScreenTableItems([
				{hotkey: 'a', title: 'Choice A', selected: true, icon: '☆'},
				{hotkey: 'b', title: 'Choice B', style: ['green']},
				{separator: true},
				{hotkey: 'c', columns: [{title: 'C'}, {title: 'Choice with Column'}]},
				{hotkey: 'd', columns: [{title: 'D'}, {title: 'Choice with Column'}]}
			]),
			new dialog.Components.ScreenEditor({
				title: 'Insert Text:',
				text: 'another editable text',
				hotkey: 'n',
				style: ['bold']
			}),
			new dialog.Components.ScreenToolbar([
				{title: 'Command 1'}, {span: true}, {hotkey: 'q', title: 'Quit', style: ['red']}
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