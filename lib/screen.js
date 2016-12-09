const os = require('os');
const colors = require('colors/safe');
const DrawTable = require('./draw-table');
const CellType = DrawTable.CellType;
const DrawChars = require('./draw-chars');
const readline = require('readline');

class Screen {

	constructor(options) {
		this.opts = options;
		this.opts.colors = this.opts.colors || {
				selected: 'cyan',
				input: 'underline',
				disabled: 'gray'
			};
		this.empty();
		this.build(options);
	}

	empty() {
		this.rows = [];
		this.selected = null;
		this.hotkeys = {};
		this.selectGroups = [];
	}

	clearScreen() {
		if (this.opts.clear) {
			readline.cursorTo(process.stdin, 0, 0);
			readline.clearScreenDown(process.stdin);
		}
	}

	rebuild() {
		this.empty();
		this.build(this.opts);
	}

	build(options) {
		let parts = (options.components || []).map(component => {
			let table = component.buildTable(options);
			return {
				component,
				table,
				width: table.width(),
				selects: []
			};
		}).filter(part => {
			return part.table.rows.length > 0;
		});

		let max_width = 0;
		parts.forEach(part => {
			max_width = Math.max(max_width, part.width);
		});
		parts.forEach(part => {
			part.table.fillColumns(max_width);
		});
		let selected = null;
		let rows = [];
		if (options.border) {
			rows.push(Screen.topLine(max_width));
		}
		parts.forEach((part, i) => {
			if (options.border && i > 0) {
				rows.push(Screen.midLine(max_width));
			}
			let new_rows = part.table.render();
			part.yOffset = rows.length;
			part.height = new_rows.length;
			if (part.component.canSelect) {
				new_rows.forEach((row, j) => {
					let w = 0;
					row.forEach((cell) => {
						cell.xOffset = w;
						cell.yOffset = rows.length + j;
						cell.part = part;
						if (!cell.disabled) {
							if (cell.hotkey) {
								this.hotkeys[cell.hotkey] = cell;
							}
							if ([CellType.select, CellType.editor].indexOf(cell.type) >= 0) {
								part.selects.push(cell);
								if (this.selectGroups.indexOf(part) < 0) {
									this.selectGroups.push(part);
								}
							}
							if (cell.selected) {
								selected = cell;
							}
						}
						w = w + cell.value.length + 1;
					});
				});
			}
			rows = rows.concat(new_rows);
		});

		if (options.border) {
			rows.push(Screen.bottomLine(max_width));
		}

		if (!selected) {
			let group = this.lastGroup();
			if (group) {
				selected = group[group.length - 1];
			}
		}

		this.selected = selected;
		this.rows = rows;
	}

	firstGroup() {
		return this.selectGroups[0].selects;
	}

	lastGroup() {
		let part = this.selectGroups[this.selectGroups.length - 1];
		return part ? part.selects : null;
	}

	static getPrevInGroup(item, group) {
		let index = group.indexOf(item);
		index--;
		if (index >= 0) {
			return group[index];
		}
	}

	static getNextInGroup(item, group) {
		let index = group.indexOf(item);
		index++;
		if (index < group.length) {
			return group[index];
		}
	}

	getNextGroup(part) {
		let index = this.selectGroups.indexOf(part);
		index++;
		if (index < this.selectGroups.length) {
			return this.selectGroups[index].selects;
		}
	}

	getPrevGroup(part) {
		let index = this.selectGroups.indexOf(part);
		index--;
		if (index >= 0) {
			return this.selectGroups[index].selects;
		}
	}

	selectComponent(component, first) {
		this.selectGroups.forEach(group => {
			if (group.component === component) {
				if (first) {
					this.selected = group.selects[0];
				} else {
					this.selected = group.selects[group.selects.length - 1];
				}
			}
		});
	}

	selectByItemConfig(editConfig) {
		this.selectGroups.forEach(group => {
			group.selects.forEach(item => {
				if (item.config === editConfig) {
					this.selected = item;
				}
			});
		});
	}

	findHotKey(ch) {
		return this.hotkeys[ch] || this.hotkeys[ch.toLowerCase()];
	}

	select_pageup() {
		if (this.selected && this.selected.part.component.canScroll) {
			let component = this.selected.part.component;
			if (component.canScrollUp()) {
				this.scrollComponentUp(component);
				this.selectComponent(component, false);
				this.print();
				return this.selected;
			}
		}
		return this.select_first();
	}

	select_pagedown() {

		if (this.selected.part.component.canScroll) {
			let component = this.selected.part.component;
			if (component.canScrollDown()) {
				this.scrollComponentDown(component);
				this.selectComponent(component, true);
				this.print();
				return this.selected;
			}
		}

		return this.select_last();
	}

	select_tab() {
		if (this.selected) {
			let group = this.getNextGroup(this.selected.part);
			if (group) {
				return this.select(group[0]);
			}
		}
		let group = this.firstGroup();
		if (group) {
			return this.select(group[0]);
		}
	}

	select_first() {
		if (this.selected) {
			let group = this.selected.part.selects;
			let item = group[0];
			if (item !== this.selected) {
				return this.select(item);
			}
			group = this.getPrevGroup(this.selected.part);
			if (group) {
				return this.select(group[0]);
			}
		}
	}

	select_last() {
		if (this.selected) {
			let group = this.selected.part.selects;
			let item = group[group.length - 1];
			if (item !== this.selected) {
				return this.select(item);
			}
			group = this.getNextGroup(this.selected.part);
			if (group) {
				return this.select(group[group.length - 1]);
			}
		}
	}

	select_up() {
		if (this.selected) {

			let group = this.selected.part.selects;
			let item = Screen.getPrevInGroup(this.selected, group);

			while (item && (item.yOffset === this.selected.yOffset)) {
				item = Screen.getPrevInGroup(item, group);
			}
			if (item) {
				return this.select(item);
			}

			if (this.selected.part.component.canScroll) {
				let component = this.selected.part.component;
				if (component.canScrollUp()) {
					this.scrollComponentUp(component);
					this.selectComponent(component, false);
					this.print();
					return this.selected;
				}
			}
			group = this.getPrevGroup(this.selected.part);
			if (group) {
				return this.select(group[group.length - 1]);
			}

			if (this.selected.editor && !this.selected.editor.isCursorAtStart()) {
				this.resetCursor();
				this.selected.editor.offset--;
				this.print();
				return this.selected;
			}
		}
	}

	select_left() {
		if (this.selected) {
			if (this.selected.editor && !this.selected.editor.isCursorAtStart()) {
				this.resetCursor();
				this.selected.editor.offset--;
				this.print();
				return this.selected;
			}
			let group = this.selected.part.selects;
			let item = Screen.getPrevInGroup(this.selected, group);
			if (item) {
				return this.select(item);
			}

			if (this.selected.part.component.canScroll) {
				let component = this.selected.part.component;
				if (component.canScrollUp()) {
					this.scrollComponentUp(component);
					this.selectComponent(component, false);
					this.print();
					return this.selected;
				}
			}

			group = this.getPrevGroup(this.selected.part);
			if (group) {
				return this.select(group[group.length - 1]);
			}
		}
	}

	select_down() {
		if (this.selected) {

			let group = this.selected.part.selects;
			let item = Screen.getNextInGroup(this.selected, group);
			while (item && (item.yOffset === this.selected.yOffset)) {
				item = Screen.getNextInGroup(item, group);
			}
			if (item) {
				return this.select(item);
			}

			if (this.selected.part.component.canScroll) {
				let component = this.selected.part.component;
				if (component.canScrollDown()) {
					this.scrollComponentDown(component);
					this.selectComponent(component, true);
					this.print();
					return this.selected;
				}
			}
			group = this.getNextGroup(this.selected.part);
			if (group) {
				return this.select(group[0]);
			}

			if (this.selected.editor && !this.selected.editor.isCursorAtEnd()) {
				this.resetCursor();
				this.selected.editor.offset++;
				this.print();
				return this.selected;
			}
		}
	}

	select_right() {
		if (this.selected) {

			if (this.selected.part.component.canScroll) {
				let component = this.selected.part.component;
				if (component.canScrollDown()) {
					this.scrollComponentDown(component);
					this.selectComponent(component, true);
					this.print();
					return this.selected;
				}
			}

			if (this.selected.editor && !this.selected.editor.isCursorAtEnd()) {
				this.resetCursor();
				this.selected.editor.offset++;
				this.print();
				return this.selected;
			}

			let group = this.selected.part.selects;
			let item = Screen.getNextInGroup(this.selected, group);
			if (item) {
				return this.select(item);
			}

			group = this.getNextGroup(this.selected.part);
			if (group) {
				return this.select(group[0]);
			}
		}
	}

	scrollComponentUp(component) {
		this.clear();
		component.scrollUp();
		this.rebuild();
	}

	scrollComponentDown(component) {
		this.clear();
		component.scrollDown();
		this.rebuild();
	}

	click(item) {
		if (item && item.execute) {
			item.execute(this, item);
			return true;
		}
	}

	backspace() {
		if (this.selected && this.selected.editor) {
			this.resetCursor();
			let editorConfig = this.selected.config;
			this.selected.editor.backspace();
			this.rebuild();
			this.selectByItemConfig(editorConfig);
			this.print();
			return this.selected;
		}
	}

	input(ch) {
		if (this.selected && this.selected.editor) {
			this.resetCursor();
			let editorConfig = this.selected.config;
			this.selected.editor.insert(ch);
			this.rebuild();
			this.selectByItemConfig(editorConfig);
			this.print();
		} else {
			let hot = this.findHotKey(ch);
			if (hot && hot.editor) {
				this.resetCursor();
				this.selected = hot;
				this.print();
			} else if (hot && hot.execute) {
				hot.execute(this, hot);
			} else {
				return hot;
			}
		}
	}

	static topLine(width) {
		return [new DrawTable.Components.BorderCell(DrawChars.top_left, DrawChars.mid, DrawChars.top_right, width)];
	}

	static midLine(width) {
		return [new DrawTable.Components.BorderCell(DrawChars.left_mid, DrawChars.mid, DrawChars.right_mid, width)];
	}

	static bottomLine(width) {
		return [new DrawTable.Components.BorderCell(DrawChars.bottom_left, DrawChars.mid, DrawChars.bottom_right, width)];
	}

	applyStyle(s, style) {
		let result = s;
		(style || []).forEach(st => {
			if (st) {
				result = colors[st](result);
			}
		});
		return result;
	}

	print() {
		this.rows.forEach(row => {
			let hasSelected = row.indexOf(this.selected) >= 0;
			let line = row.map(cell => {
				let result = cell.value;
				if (cell.disabled) {
					result = this.applyStyle(result, [this.opts.colors.disabled]);
				} else if (cell.type === CellType.editor && cell.style) {
					result = this.applyStyle(result, cell.style);
				} else if (cell === this.selected || (hasSelected && cell.part.component.opts && cell.part.component.opts.fullrowselect && (cell.type === CellType.text))) {
					result = this.applyStyle(result, [this.opts.colors.selected]);
				} else if (cell.style) {
					result = this.applyStyle(result, cell.style);
				}
				return result;
			}).join(' ');
			process.stdout.write(line + ' ' + os.EOL);
		});
		if (this.opts.footer) {
			process.stdout.write(this.opts.footer);
		}
		readline.moveCursor(process.stdout,
			(this.selected && this.selected.editor ? this.selected.editor.offset : 0)
			- (this.rows.length > 0 ? (this.opts.footer ? this.opts.footer.length : 0) : 0)
			+ (this.selected ? this.selected.xOffset : 0),
			-(this.rows.length - (this.selected ? this.selected.yOffset : 0))
		);
	}

	resetCursor() {
		readline.moveCursor(process.stdout,
			-(this.selected ? this.selected.xOffset : 0)
			- (this.rows.length === 0 ? (this.opts.footer ? this.opts.footer.length : 0) : 0)
			- (this.selected && this.selected.editor ? this.selected.editor.offset : 0)
			- 3,
			-(this.selected ? this.selected.yOffset : 0)
		);
	};

	select(item) {
		if (item && item !== this.selected) {
			this.resetCursor();
			this.selected = item;
			this.print();
			return item;
		}
	}

	mouse(x, y, scroll) {
		y--;
		x--;

		if (scroll !== 0) {
			for (let p = 0; p < this.selectGroups.length; p++) {
				let part = this.selectGroups[p];
				if (part.component.canScroll && y >= part.yOffset && y < part.yOffset + part.height) {
					if (scroll < 0) {
						if (part.component.canScrollUp()) {
							this.scrollComponentUp(part.component);
							this.print();
						}
					} else if (scroll > 0) {
						if (part.component.canScrollDown()) {
							this.scrollComponentDown(part.component);
							this.print();
						}
					}
				}
			}
		} else {
			for (let p = 0; p < this.selectGroups.length; p++) {
				let part = this.selectGroups[p];
				for (let i = 0; i < part.selects.length; i++) {
					let item = part.selects[i];
					if (y === item.yOffset) {
						if (x >= item.xOffset && x <= item.xOffset + item.value.length) {
							if (item.editor) {
								let pos = Math.max(0, Math.min(item.editor.item.text.length, x - item.xOffset));
								this.resetCursor();
								item.editor.offset = pos;
								this.selected = item;
								this.print();
							} else if (item.execute) {
								item.execute(this, item);
								return;
							} else {
								console.log('item');
								if (this.selected !== item) {
									this.resetCursor();
									this.selected = item;
									this.print();
								}
								return item;
							}
						}
					}
				}
			}
		}
	}

	clear() {
		this.resetCursor();
		readline.clearScreenDown(process.stdout);
	}
}

module.exports = Screen;
