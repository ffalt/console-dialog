const keypress = require('keypress');

class ScreenExecuter {

	constructor() {
		if (!process.stdin.setRawMode) {
			throw new Error('Cannot capture STDIN; This console is not supported');
		}
	}

	execute(screen) {
		if (screen.opts.clear) {
			screen.clearScreen();
		}
		screen.print();

		return new Promise((resolve) => {

			let apply = (item) => {
				process.stdin.setRawMode(false);
				screen.clear();
				process.stdin.removeListener('keypress', handleKeypress);
				if (screen.opts.mouse && screen.opts.clear) {
					process.stdin.removeListener('mousepress', handleMousepress);
					keypress.disableMouse(process.stdout);
				}
				process.stdin.pause();
				resolve(item ? (item.config || item) : null);
			};

			let handleMousepress = (info) => {
				if (info.release || info.scroll) {
					let hot = screen.mouse(info.x, info.y, info.scroll);
					if (hot) {
						apply(hot);
					}
				} else if (info.scroll) {
					console.log(info.scroll);
				}
			};

			let handleKeypress = (ch, key) => {
				if (key) {
					switch (key.name) {
						case 'return':
						case 'enter': {
							if (screen.selected) {
								if (!screen.click(screen.selected)) {
									apply(screen.selected);
								}
								return;
							}
							break;
						}
						case 'escape': {
							return apply(null);
						}
						case 'c': {
							if (key.ctrl) {
								return apply(null);
							}
							break;
						}
						case 'up': {
							return screen.select_up();
						}
						case 'down': {
							return screen.select_down();
						}
						case 'pageup': {
							return screen.select_pageup();
						}
						case 'pagedown': {
							return screen.select_pagedown();
						}
						case 'tab': {
							return screen.select_tab();
						}
						case 'home': {
							return screen.select_first();
						}
						case 'end': {
							return screen.select_last();
						}
						case 'left': {
							return screen.select_left();
						}
						case 'right': {
							return screen.select_right();
						}
						case 'backspace': {
							return screen.backspace();
						}
						default: {

						}
					}
					if (key.ctrl) {
						return;
					}
				}
				if (ch) {
					let hot = screen.input(ch);
					if (hot) {
						apply(hot);
					}
				}
			};

			process.stdin.setRawMode(true);
			process.stdin.resume();
			keypress(process.stdin);
			if (screen.opts.mouse && screen.opts.clear) {
				keypress.enableMouse(process.stdout);
				process.stdin.addListener('mousepress', handleMousepress);
			}
			process.stdin.addListener('keypress', handleKeypress);
		});
	}
}

module.exports = ScreenExecuter;
