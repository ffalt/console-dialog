const DrawChars = require('./draw-chars');

let repeat = (s, n) => {
	return (n < 0) ? '' : new Array(n + 1).join(s);
};

const CellType = {
	scroll: 'scroll',
	border: 'border',
	select: 'select',
	editor: 'editor',
	linked: 'linked',
	span: 'span',
	text: 'text'
};

class DrawTable {
	constructor(options) {
		this.opts = options;
		this.rows = [];
	}

	width() {
		let widths = this.getColumnWidths();
		let result = 0;
		for (let i = 0; i < widths.length; i++) {
			result += widths[i] + 1;
		}
		if (this.opts.border) {
			result += DrawChars.left.length + 1 + DrawChars.right.length;
		}
		return result;
	}

	getColumnWidths() {
		let result = [];
		this.rows.forEach(row => {
			row.forEach((cell, i) => {
				while (result.length <= i) {
					result.push(0);
				}
				if (cell.value.length > result[i]) {
					result[i] = cell.value.length;
				}
			});
		});
		return result;
	}

	fillColumns(width) {

		let getLastFillColumn = (row, pos) => {
			let fill_column = null;
			for (let i = pos; i >= 0; i--) {
				if (row[i].type === CellType.span) {
					fill_column = row[i];
				} else if ([CellType.scroll, CellType.border].indexOf(row[i].type) < 0) {
					if (!fill_column) {
						fill_column = row[i];
					}
				}
			}
			return fill_column;
		};


		let widths = this.getColumnWidths();
		this.rows.forEach(row => {
			for (let i = 0; i < widths.length; i++) {
				if (i < row.length) {
					row[i].value = row[i].value + repeat(DrawChars.space, widths[i] - row[i].value.length);
				} else {
					let fill_column = getLastFillColumn(row, row.length - 1);
					if (fill_column) {
						fill_column.value = fill_column.value + repeat(DrawChars.space, widths[i] + 1);
					}
				}
			}
			let w = 0;
			row.forEach(cell => {
				w += cell.value.length + 1;
			});
			let div = width - w - 3;
			if (div > 0) {
				let fill_column = getLastFillColumn(row, row.length - 1);
				if (fill_column) {
					fill_column.value = fill_column.value + repeat(DrawChars.space, div);
				}
			}
		});
	}

	render() {
		let result = [];
		this.rows.forEach(row => {
			if (this.opts.border) {
				result.push(
					[new BorderCell(DrawChars.left + DrawChars.space)].concat(row).concat([new BorderCell(DrawChars.space + DrawChars.right)])
				);
			} else {
				result.push(row);
			}
		});
		return result;
	}
}

class BorderCell {
	constructor(left, mid, right, width) {
		this.value = (left ? left : '') + (mid ? repeat(mid, width) : '') + (right ? right : '');
		this.type = CellType.border;
	}
}

class EditorCell {
	constructor(value, selected, style, hotkey, config, disabled, editor) {
		this.value = value || '';
		this.selected = selected;
		this.disabled = disabled;
		this.style = style || [];
		this.hotkey = hotkey;
		this.config = config;
		this.editor = editor;
		this.type = CellType.editor;
	}
}

class LabelCell {
	constructor(value, style) {
		this.value = value || '';
		this.style = style || [];
		this.type = CellType.text;
	}
}

class LinkedLabelCell {
	constructor(value, style, link) {
		this.value = value || '';
		this.style = style || [];
		this.link = link;
		this.type = CellType.linked;
	}
}

class SpanCell {
	constructor() {
		this.value = '';
		this.type = CellType.span;
	}
}

class ScrollCell {
	constructor(value) {
		this.value = value || '';
		this.type = CellType.scroll;
	}
}

class SelectCell {
	constructor(value, selected, style, hotkey, config, disabled, execute) {
		this.value = value || '';
		this.selected = selected;
		this.disabled = disabled;
		this.style = style || [];
		this.hotkey = hotkey;
		this.config = config;
		this.type = CellType.select;
		this.execute = execute;
	}
}

let Components = {
	SelectCell,
	BorderCell,
	LinkedLabelCell,
	ScrollCell,
	SpanCell,
	LabelCell,
	EditorCell,
	DrawTable
};

DrawTable.Components = Components;
DrawTable.CellType = CellType;
module.exports = DrawTable;
