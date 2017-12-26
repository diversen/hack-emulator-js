var keypress = require('keypress');
var cpu = require('./cpu')



keypress(process.stdin);
var c = new cpu()
c.debug = 1
c.screen = 0
c.loadROM()

process.stdin.on('keypress', function (ch, key) {
    c.cycle()
});


// c.runProgram()