let path = require('path');
let FontDefs = require('../figlet-fonts');
let fontDefs = new FontDefs(path.resolve(path.join(__dirname, '..')));
fontDefs.load();
fontDefs.saveFolder();
console.log('done');
