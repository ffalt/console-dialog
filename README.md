# console-screen

build input forms, menus & screens in the console with node

##Convenience API

```javascript

let dialog = require('console-dialog');
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
    } else {
        console.log('Dialog closed');
    }
});
```

Example Output

```
┌──────────────┐
│  a Choice A  │
│  b Choice B  │
│  c Choice C  │
└──────────────┘
Type Hotkey or select & enter
```

Example Output (see examples/example-banner-fonts.js)

```
┌───────────────────────────────────┐
│  Choose Banner                    │
├───────────────────────────────────┤
│  Demo Text: Demo                  │
├───────────────────────────────────┤
│  ● serifcap                    ▴  │
│  ● shadow                      ░  │
│  ● short                       ░  │
│  ● slant                       ░  │
│  ● slide                       ░  │
│  ● slscript                    ░  │
│  ● small                       ░  │
│  ● smisome1                    ▓  │
│  ● smkeyboard                  ░  │
│  ● smscript                    ▾  │
├───────────────────────────────────┤
│  Page: 11/15 Items: 110/147  ↓ ↑  │
├───────────────────────────────────┤
│    ___                            │
│   |   \   ___   _ __    ___       │
│   | |) | / -_) | '  \  / _ \      │
│   |___/  \___| |_|_|_| \___/      │
├───────────────────────────────────┤
│  q Quit                           │
└───────────────────────────────────┘
```

## Components

#### ScreenTextLine
A simple label

##### new dialog.Components.ScreenTextLine(text, style)

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to display |
| style | <code>array</code> | e.g. ['bold','red'] |

```javascript
new dialog.Components.ScreenTextLine('Hello World', ['bold'])
```

#### ScreenBanner
A ascii art font label based on [figlet](https://github.com/patorjk/figlet.js)

##### new dialog.Components.ScreenBanner(text, style)

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to display |
| font | <code>string</code> | e.g. 'banner' |

```javascript

new dialog.Components.ScreenTextLine('WOW', 'small')
```


### ScreenEdit
A text editor with optional label

##### new dialog.Components.ScreenEditor(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Editor Option |

### ScreenEdits
A list of text editors with optional label

##### new dialog.Components.ScreenEdits(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>array</code> | array of Editor Option |

Editor Option

| Field | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Default text to edit |
| hotkey | <code>string</code> | Hotkey of edit |
| selected | <code>boolean</code> | is selected, default: false |
| disabled | <code>boolean</code> | is disabled, default: false |
| title | <code>string</code> | Label text |
| style | <code>array</code> | Label style e.g. ['bold','red'] |

```javascript

new dialog.Components.ScreenEdits([
    {
        text: 'editable text',
        hotkey: 'n',
        title: 'Insert Text:',
        style: ['bold']
    }
])
```

### ScreenToolbar
A horizontal toolbar with selectable items

##### new dialog.Components.ScreenToolbar(items)

| Param | Type | Description |
| --- | --- | --- |
| items | <code>array</code> | array of Toolbar Item |

Toolbar Item

| Field | Type | Description |
| --- | --- | --- |
| icon | <code>string</code> | An icon char (otherwise hotkey or bullet is shown) |
| hotkey | <code>string</code> | Hotkey of the item |
| selected | <code>boolean</code> | is selected, default: false |
| disabled | <code>boolean</code> | is disabled, default: false |
| title | <code>string</code> | Item text |
| style | <code>array</code> | Item style e.g. ['bold','red'] |

Toolbar Span Item

| Field | Type | Description |
| --- | --- | --- |
| span | <code>boolean</code> | must be true. Creates an auto expanding span item (used e.g. for right align items)|

```javascript

new dialog.Components.ScreenToolbar([
	{hotkey: '1', title: 'Command 1', disabled: true},
	{hotkey: '2', title: 'Command 2', selected: true},
	{span: true},
	{hotkey: 'q', title: 'Quit', style: ['red']}
])
```

### ScreenTable
A static table

##### new dialog.Components.ScreenTable(items)

| Param | Type | Description |
| --- | --- | --- |
| items | <code>array</code> | array of Table Row Columns Table Row and Table Row Spacer |

Table Row Spacer

| Field | Type | Description |
| --- | --- | --- |
| separator | <code>boolean</code> | must be true. Creates an empty row |

Table Row

| Field | Type | Description |
| --- | --- | --- |
| icon | <code>string</code> | An icon char (otherwise list bullet is shown) |
| title | <code>string</code> | Text of Row |
| style | <code>array</code> | Row style e.g. ['bold','red'] |

Table Row Columns

| Field | Type | Description |
| --- | --- | --- |
| icon | <code>string</code> | An icon char (otherwise list bullet is shown) |
| columns | <code>array</code> | array of Table Label Column |
| style | <code>array</code> | Row style e.g. ['bold','red'] |

Table Label Column

| Field | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | Text of Column |
| style | <code>array</code> | Row style e.g. ['bold','red'] |

```javascript

new dialog.Components.ScreenTable([
	{icon: '☆', title: 'Line 1'},
	{icon: '☆', title: 'Line 2', style: ['inverse']},
	{icon: '☆', title: 'Line 3'},
	{separator: true},
	{icon: '☆', title: 'Line 4', style: ['green']}
])

new dialog.Components.ScreenTable([
	{icon: '☆', columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2'},
	    {title: 'Column 3'},
	]},
	{icon: '☆', columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2'},
	    {title: 'Column 3'},
	]},
	{separator: true},
	{icon: '☆', columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2'},
	    {title: 'Column 3'},
	], style: ['blue']},
])
```

### ScreenTableItems
A table with selectable rows

##### new dialog.Components.ScreenTableItems(items, options)

| Param | Type | Description |
| --- | --- | --- |
| items | <code>array</code> | array of Table Item Columns and Table Item and Table Item Spacer |
| options | <code>object</code> | Table Settings |

Table Settings

| Field | Type | Description |
| --- | --- | --- |
| nrOnPage | <code>integer</code> | Pagination, how many items on a page |
| page | <code>integer</code> | default 0, page to display |
| fullrowselect | <code>boolean</code> | default true, if every colomn should hightlight if selected |

Table Item Spacer

| Field | Type | Description |
| --- | --- | --- |
| separator | <code>boolean</code> | must be true. Creates an empty item |

Table Item Columns

| Field | Type | Description |
| --- | --- | --- |
| columns | <code>array</code> | array of Table Item Column |
| icon | <code>string</code> | An icon char (otherwise list hotkey or bullet is shown) |
| style | <code>array</code> | Row style e.g. ['bold','red'] |
| hotkey | <code>string</code> | Hotkey of the item |
| selected | <code>boolean</code> | is selected, default: false |
| disabled | <code>boolean</code> | is disabled, default: false |

Table Item

| Field | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | Text of the item |
| icon | <code>string</code> | An icon char (otherwise list hotkey or bullet is shown) |
| style | <code>array</code> | Row style e.g. ['bold','red'] |
| hotkey | <code>string</code> | Hotkey of the item |
| selected | <code>boolean</code> | is selected, default: false |
| disabled | <code>boolean</code> | is disabled, default: false |

```javascript

new dialog.Components.ScreenTableItems([
	{icon: '☆', hotkey:'1', title: 'Line 1', disabled: true},
	{icon: '☆', hotkey:'2', title: 'Line 2', style: ['inverse']},
	{icon: '☆', hotkey:'3', title: 'Line 3', selected: true},
	{separator: true},
	{icon: '☆', hotkey:'4', title: 'Line 4', style: ['green']}
], { nrOnPage: 11 })

new dialog.Components.ScreenTableItems([
	{icon: '☆', hotkey:'1', disabled: true, columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2'},
	    {title: 'Column 3'},
	]},
	{icon: '☆', hotkey:'2', columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2', style: ['inverse']},
	    {title: 'Column 3', style: ['green']},
	]},
	{separator: true},
	{icon: '☆', hotkey:'3', selected: true, columns: [
	    {title: 'Column 1'},
	    {title: 'Column 2'},
	    {title: 'Column 3'},
	], style: ['blue']},
], { nrOnPage: 11 })
```


### ScreenTableItems
A toolbar for ScreenTableItems with info & page up + page down buttons

##### new dialog.Components.ScreenTableItems(items, options)

| Param | Type | Description |
| --- | --- | --- |
| items | <code>object</code> |the ScreenTableItems the toolbar is for |


```javascript

table = new dialog.Components.ScreenTableItems([ ... ])

new dialog.Components.ScreenTableItemTools(table);
```

## Display

### Display Options

| Param | Type | Description |
| --- | --- | --- |
| components | <code>array</code> |array of Components |
| border | <code>boolean</code> |default false - print the table borders |
| clear | <code>boolean</code> |default false - clear the screen before printing dialog |
| mouse | <code>boolean</code> |default false - use mouse clicks to select (only with clear:true) |
| footer | <code>string</code> |A text line below the dialog |


### One Shot Dialog

```javascript

let dialog = require('console-dialog');
dialog({
    components: [ ... ],
	border: true
}).then(item => {
    if (item) {
        console.log('Item choosen:', item);
    } else {
        console.log('Dialog closed');
    }
});

```

### Reusable screen

```javascript

let dialog = require('console-dialog');
let screen = new dialog.Screen({
    components: [ ... ],
	border: true,
})

let executer = new dialog.ScreenExecuter();

let display = () => {
    executer.execute(screen)
        .then(item => {
            if (item) {
                console.log('Item choosen:', item);
            	display(); //display same screen again without recreating
            } else {
                console.log('Dialog closed');
            }
         });
};

display();

```
