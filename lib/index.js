const Components = require('./components');
const Screen = require('./screen');
const ScreenExecuter = require('./screen-executer');

function OneShot(options) {
	let screen = new Screen(options);
	let exec = new ScreenExecuter();
	return exec.execute(screen);
}

OneShot.consoleSupported = !!process.stdin.setRawMode;
OneShot.Components = Components;
OneShot.Screen = Screen;
OneShot.ScreenExecuter = ScreenExecuter;

module.exports = OneShot;
