const extend = require('extend');
const Figlet = require('./figlet');
const DrawTable = require('./draw-table');
const DrawChars = require('./draw-chars');

class ScreenTextLine {
	constructor(text, style) {
		this.text = text;
		this.style = style;
	}

	buildTable(options) {
		let table = new DrawTable(options);
		table.rows.push([new DrawTable.Components.LabelCell(this.text, this.style)]);
		return table;
	}
}

class ScreenBanner {
	constructor(text, font) {
		this.text = text;
		this.font = font;
	}

	buildTable(options) {
		let table = new DrawTable(options);
		let figlet = new Figlet();
		if (!figlet.hasFont(this.font)) {
			figlet.addFont(this.font);
		}
		let list = figlet.write(this.text, this.font);
		if (!list) {
			table.rows.push([new DrawTable.Components.LabelCell(this.text)]);
		} else {
			table.rows = list.split('\n').filter(line => {
				return line.trim().length > 0;
			}).map(line => {
				return [new DrawTable.Components.LabelCell(line)];
			});
		}
		return table;
	}
}

class Editor {
	constructor(item) {
		this.item = item;
		this.offset = item.text.length;
	}

	isCursorAtEnd() {
		return this.offset >= this.item.text.length;
	}

	isCursorAtStart() {
		return this.offset === 0;
	}

	insert(ch) {
		this.item.text = this.item.text.slice(0, this.offset) + ch + this.item.text.slice(this.offset, this.item.text.length);
		this.offset = this.offset + 1;
	}

	backspace() {
		if (this.item.text.length > 0 && this.offset > 0) {
			this.item.text = this.item.text.slice(0, this.offset - 1) + this.item.text.slice(this.offset, this.item.text.length);
			this.offset = this.offset - 1;
		}
	}
}

class ScreenEditors {
	constructor(items) {
		this.canSelect = true;
		this.items = items;
		this.editors = [];
		this.buildEditors();
	}

	buildEditors() {
		this.editors = this.items.map(item => {
			return new Editor(item);
		});
	}

	buildTable(options) {
		let table = new DrawTable(options);
		this.items.forEach((item, i) => {
			table.rows.push([
				new DrawTable.Components.LabelCell(item.title, item.style),
				new DrawTable.Components.EditorCell(item.text, item.selected, [options.colors.input], item.hotkey, item, item.disabled, this.editors[i])
			]);
		});
		return table;
	}
}

class ScreenEditor extends ScreenEditors {
	constructor(options) {
		super([options]);
	}
}

class ScreenToolbar {
	constructor(items) {
		this.items = items;
		this.canSelect = true;
	}

	buildTable(options) {
		let table = new DrawTable(options);
		let row = [];
		this.items.forEach(item => {
			if (item.span) {
				row.push(new DrawTable.Components.SpanCell());
			} else if (item.label) {
				row.push(new DrawTable.Components.LabelCell(item.title, item.style));
			} else {

				row.push(new DrawTable.Components.SelectCell((item.icon || item.hotkey || DrawChars.button), item.selected, item.style, item.hotkey, item, item.disabled));
				row.push(new DrawTable.Components.LinkedLabelCell(item.title, item.style));
			}
		});
		if (row.length === 0) {
			row.push(new DrawTable.Components.LabelCell());
		}
		table.rows.push(row);
		return table;
	}
}

class ScreenTable {
	constructor(items) {
		this.items = items;
	}

	buildTable(options) {
		let table = new DrawTable(options);
		this.items.forEach(item => {
			let row = [];
			if (item.separator) {
				row.push(new DrawTable.Components.SpanCell());
			} else {
				if (item.icon) {
					row.push(new DrawTable.Components.LabelCell(item.icon, item.style));
				}
				if (item.columns) {
					item.columns.forEach(col => {
						row.push(new DrawTable.Components.LabelCell(col.title, col.style || item.style));
					});
				} else if (item.title) {
					row.push(new DrawTable.Components.LabelCell(item.title, item.style));
				}
			}
			table.rows.push(row);
		});
		return table;
	}
}

class ScreenTableItemTools {
	constructor(screentable, opts) {
		this.component = screentable;
		this.canSelect = true;
		this.lastTable = null;
		this.opts = {
			up: {selected: false, hotkey: null, char: '↓'},
			down: {selected: false, hotkey: null, char: '↑'}
		};
		extend(true, this.opts, opts);
	}

	buildTable(options) {
		let table = new DrawTable(options);
		if (this.component.totalPages() > 1) {
			table.rows.push([
				new DrawTable.Components.LabelCell(`Page: ${ this.component.page() }/${ this.component.totalPages()}`),
				new DrawTable.Components.LabelCell(`Items: ${ this.component.startItemNrOnPage() }/${ this.component.all.length}`),
				new DrawTable.Components.SpanCell(),
				new DrawTable.Components.SelectCell(this.opts.up.char, this.opts.up.selected, this.opts.down.style, this.opts.up.hotkey, options, !this.component.canScrollUp(), (screen) => {
					screen.scrollComponentUp(this.component);
					screen.selected = this.lastTable.rows[0][this.component.canScrollUp() ? 3 : 4];
					screen.print();
				}),
				new DrawTable.Components.SelectCell(this.opts.down.char, this.opts.down.selected, this.opts.up.style, this.opts.up.hotkey, options, !this.component.canScrollDown(), (screen) => {
					screen.scrollComponentDown(this.component);
					screen.selected = this.lastTable.rows[0][this.component.canScrollDown() ? 4 : 3];
					screen.print();
				})
			]);
		}
		this.lastTable = table;
		return table;
	}
}

class ScreenTableItems {
	constructor(items, opts) {
		this.opts = {
			nrOnPage: 10,
			page: 0,
			fullrowselect: true
		};
		extend(true, this.opts, opts);
		this.all = items;
		this.items = items;
		this.canSelect = true;
		this.canScroll = true;
		this.setPage(this.opts.page);
	}

	buildTable(options) {
		let table = new DrawTable(options);
		let showScollBar = this.all.length > this.items.length;
		let colcount = 0;
		this.items.forEach((item) => {
			let row = [];
			if (item.separator) {
				row.push(new DrawTable.Components.SpanCell());
			} else {
				row.push(new DrawTable.Components.SelectCell((item.icon || item.hotkey || DrawChars.button), item.selected, item.style, item.hotkey, item, item.disabled));
				if (item.columns) {
					item.columns.forEach((col) => {
						row.push(new DrawTable.Components.LabelCell(col.title, col.style || item.style));
					});
				} else if (item.title) {
					row.push(new DrawTable.Components.LabelCell(item.title, item.style));
				}
			}
			colcount = Math.max(colcount, row.length);
			table.rows.push(row);
		});

		let scrollpos = Math.floor((this.items.length) * this.opts.page / this.totalPages());
		if (this.opts.page === this.totalPages() - 1) {
			scrollpos = this.items.length - 1;
		}
		table.rows.forEach((row, i) => {
			while (row.length < colcount) {
				row.push(new DrawTable.Components.LabelCell());
			}
			if (showScollBar) {
				if (i === scrollpos) {
					row.push(new DrawTable.Components.ScrollCell(DrawChars.scroll_handle));
				} else if (i === 0) {
					row.push(new DrawTable.Components.ScrollCell(this.isFirstPage() ? DrawChars.scroll_back : DrawChars.scroll_up));
				} else if (i === this.items.length - 1) {
					row.push(new DrawTable.Components.ScrollCell(this.isLastPage() ? DrawChars.scroll_back : DrawChars.scroll_down));
				} else {
					row.push(new DrawTable.Components.ScrollCell(DrawChars.scroll_back));
				}
			}
		});

		return table;
	}

	startItemNrOnPage() {
		return (this.opts.page * this.opts.nrOnPage);
	}

	endItemNrOnPage() {
		return ((this.opts.page * this.opts.nrOnPage) + this.opts.nrOnPage);
	}

	page() {
		return this.opts.page;
	}

	totalPages() {
		return Math.ceil(this.all.length / this.opts.nrOnPage);
	}

	isLastPage() {
		return !(((this.opts.page + 1) * this.opts.nrOnPage) < this.all.length);
	}

	isFirstPage() {
		return this.opts.page === 0;
	}

	canScrollUp() {
		return (this.canScroll && !this.isFirstPage())
	}

	canScrollDown() {
		return (this.canScroll && !this.isLastPage())
	}

	scrollDown() {
		this.setPage(this.opts.page + 1);
	}

	scrollUp() {
		this.setPage(this.opts.page - 1);
	}

	setPage(page) {
		this.opts.page = page;
		this.items = this.all.slice(this.opts.page * this.opts.nrOnPage, (this.opts.page * this.opts.nrOnPage) + this.opts.nrOnPage);
	}

}

let Components = {
	ScreenBanner,
	ScreenTable,
	ScreenEditor,
	ScreenEditors,
	ScreenTextLine,
	ScreenToolbar,
	ScreenTableItems,
	ScreenTableItemTools
};

module.exports = Components;
