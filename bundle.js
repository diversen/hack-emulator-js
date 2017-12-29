(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * As the hack computer is quite small
 * Everything is placed in this file
 * CPU, RAM, ROM, Screen, Keyboard
 */

var assembler = require('hack-assembler')

function Hack() {

    this.ROM = new Array(32767 + 1) // 0x0000 to 0x8000
    this.RAM = new Array(24576 + 1) // 0x0000 to 0x6000
    this.RAM.fill(0)

    this.KBD = 24576    // Keyboard position in 0x6000
    this.PC = 0
    this.DRegister = 0
    this.ARegister = 0

    this.comp = {
        // '0101010': '0',
        '0101010': () => {
            return 0
        },
        // '0111111': '1',
        '0111111': () => {
            return 1
        },
        // '0111010': '-1',
        '0111010': () => {
            return -1
        },
        // '0001100': 'D',
        '0001100': () => {
            return this.DRegister
        },
        // '0110000': 'A',
        '0110000': () => {
            return this.ARegister
        },
        // '0001101': '!D',
        '0001101': () => {
            return ~this.DRegister
        },
        // '0110001': '!A',
        '0110001': () => {
            return ~this.ARegister
        },
        // '0001111': '-D',
        '0001111': () => {
            return -this.DRegister
        },
        // '0110011': '-A',
        '0110011': () => {
            return -this.ARegister
        },
        // '0011111': 'D+1',
        '0011111': () => {
            return this.DRegister + 1
        },
        // '0110111': 'A+1',
        '0110111': () => {
            return this.ARegister + 1
        },
        // '0001110': 'D-1',
        '0001110': () => {
            return this.DRegister - 1
        },
        // '0110010': 'A-1',
        '0110010': () => {
            return this.ARegister - 1
        },
        // '0000010': 'D+A',
        '0000010': () => {
            return this.DRegister + this.ARegister
        },
        // '0010011': 'D-A',
        '0010011': () => {
            return this.DRegister - this.ARegister
        },
        // '0000111': 'A-D',
        '0000111': () => {
            return this.ARegister - this.DRegister
        },
        // '0000000': 'D&A',
        '0000000': () => {
            return this.DRegister & this.ARegister
        },
        // '0010101': 'D|A',
        '0010101': () => {
            return this.DRegister | this.ARegister
        },
        // '1110000': 'M',
        '1110000': () => {
            return this.RAM[this.ARegister]
        },
        // '1110001': '!M',
        '1110001': () => {
            return ~this.RAM[this.ARegister]
        },
        // '1110011': '-M',
        '1110011': () => {
            return -this.RAM[this.ARegister]
        },
        // '1110111': 'M+1',
        '1110111': () => {
            return this.RAM[this.ARegister] + 1
        },
        // '1110010': 'M-1',
        '1110010': () => {
            return this.RAM[this.ARegister] - 1
        },
        // '1000010': 'D+M',
        '1000010': () => {
            return this.DRegister + this.RAM[this.ARegister]
        },
        // '1010011': 'D-M',
        '1010011': () => {
            return this.DRegister - this.RAM[this.ARegister]
        },
        // '1000111': 'M-D',
        '1000111': () => {
            return this.RAM[this.ARegister] - this.DRegister
        },
        // '1000000': 'D&M',
        '1000000': () => {
            return this.DRegister & this.RAM[this.ARegister]
        },
        // '1010101': 'D|M'
        '1010101': () => {
            return this.DRegister | this.RAM[this.ARegister]
        }
    }

    // Destination
    this.dest = {
        // '000': '0',
        '000': (val) => {
            // Do nothing
        },
        // '001': 'M',
        '001': (val) => {
            this.setRAM(val)
        },
        // '010': 'D',
        '010': (val) => {
            this.DRegister = val
        },
        // '011': 'MD',
        '011': (val) => {
            this.DRegister = val
            this.setRAM(val)
        },
        // '100': 'A',
        '100': (val) => {
            this.ARegister = val
        },
        // '101': 'AM',
        '101': (val) => {

            this.setRAM(val)
            this.ARegister = val
        },
        // '110': 'AD',
        '110': (val) => {

            this.DRegister = val
            this.ARegister = val
        },
        // '111': 'AMD'
        '111': (val) => {

            this.DRegister = val
            this.setRAM(val)
            this.ARegister = val
        }
    }

    this.jump = {
        // '000': '0',
        '000': (val) => {
            return false
        },
        // '001': 'JGT',
        '001': (val) => {
            if (val > 0) {
                return true
            }
        },
        // '010': 'JEQ',
        '010': (val) => {
            if (val == 0) {
                return true
            }
        },
        // '011': 'JGE',
        '011': (val) => {
            if (val >= 0) {
                return true
            }
        },
        // '100': 'JLT',
        '100': (val) => {
            if (val < 0) {
                return true
            }
        },
        // '101': 'JNE',
        '101': (val) => {
            if (val != 0) {
                return true
            }
        },
        // '110': 'JLE',
        '110': (val) => {
            if (val <= 0) {
                return true
            }
        },
        // '111': 'JMP'
        '111': (val) => {
            return true
        }
    }


    // Screen
    this.SIZE_BITS = 512 * 256
    this.SIZE_WORDS = this.SIZE_BITS / 16
    this.SCREEN_RAM = 16384

    this.CANVAS = null
    this.CANVAS_CTX = null
    this.CANVAS_DATA = null

    function getBinVal(i) {
        var bin = i.toString(2)
        while (bin.length < 32) {
            bin = "0" + bin
        }
        return bin
    }

    // Used for the screen
    // Screen operates bit patterns
    // 1 is on 0 is off
    function dec2bin(dec) {
        var bin = (dec >>> 0).toString(2)
        var bit32 = getBinVal(bin)
        return bit32.substring(16, 32)

    }

    // Get X and Y position of the word on the image
    // According to the position in RAM
    // RAM[16384 + r*32 + c%16]
    this.getImageRowColumn = function () {
        var numWord = this.ARegister - this.SCREEN_RAM

        var y = Math.floor(numWord * 16 / 512)
        var x = numWord * 16 % 512

        var xy = { x: x, y: y }

        return xy
    }

    // Draw pixel on canvas
    this.drawPixel = function (x, y, r, g, b, a) {

        var index = (x + y * this.CANVAS.width) * 4;

        this.CANVAS_DATA.data[index + 0] = r;
        this.CANVAS_DATA.data[index + 1] = g;
        this.CANVAS_DATA.data[index + 2] = b;
        this.CANVAS_DATA.data[index + 3] = a;
    }

    this.updateImageData = function (val) {

        // get bin val
        var rowColumn = this.getImageRowColumn()
        var x = rowColumn.x
        var y = rowColumn.y

        var binVal = dec2bin(val)
        var binAry = binVal.split('')

        binAry.forEach((elem, i) => {
            if (elem == 1) {
                this.drawPixel(x + 16 - i, y, 0, 0, 0, 255)
            } else {
                this.drawPixel(x + 16 - i, y, 255, 255, 255, 0)
            }
        })
    }

    this.updateCanvas = function () {
        this.CANVAS_CTX.putImageData(this.CANVAS_DATA, 0, 0);
    }

    // Just in order to turn off screen
    this.screen = 1

    // Set screen RAM for fast access
    // As screen is updated often
    this.setRAM = function (val) {
        this.RAM[this.ARegister] = val
        if (this.ARegister >= this.SCREEN_RAM && this.ARegister < this.KBD) {
            if (this.screen) {
                this.updateImageData(val)
            }
        }
    }

    // Instruction: ixxaccccccdddjjj
    // Get opcode
    // 0 = C instruction 
    // 1 = A instruction
    this.getOpcode = function (ins) {
        return ins.substring(0, 1)
    }

    this.getComp = function (ins) {
        return ins.substring(3, 10)
    }

    this.getDest = function (ins) {
        return ins.substring(10, 13)
    }

    this.getJump = function (ins) {
        return ins.substring(13, 16)
    }

    this.debugCycle = function (ins) {

        if (!this.debug) {
            return
        }
        var opcode = this.getOpcode(ins)
        console.log('Opcode ', opcode)
        if (opcode == 0) {
            console.log('At ', parseInt(ins, 2))
            console.log('At (value) ', this.RAM[parseInt(ins, 2)])
        }

        console.log('Ins ', ins)
        console.log('PC ', this.PC)
        console.log('After Parse')

        console.log('ALUOut', this.ALUOut)
        console.log('AReg ', this.ARegister)
        console.log('DReg ', this.DRegister)

        console.log(this.RAM.slice(0, 16))
        console.log('---')
    }

    this.cyclesDone = 0
    this.debug = 0

    this.cycle = function () {
        this.currentPC = this.PC

        if (typeof this.ROM[this.PC] == 'undefined') {
            return
        }

        var ins = this.ROM[this.PC]

        var opcode = this.getOpcode(ins)
        if (opcode == 1) {
            this.cycleC(ins)
        } else {
            this.cycleA(ins)
        }

        this.cyclesDone++
        if (this.cyclesDone % 100000 == 0) {
            if (this.debug) {
                console.log(this.cyclesDone)
            }
        }
    }

    this.cycleC = function (ins) {

        var comp = this.getComp(ins)
        var dest = this.getDest(ins)
        var jump = this.getJump(ins)
        var jumped = false

        var ALUOut = this.comp[comp]()
        this.ALUOut = ALUOut

        if (dest != '000') {
            this.dest[dest](ALUOut)
        }

        if (jump != '000') {
            if (this.jump[jump](ALUOut)) {
                this.PC = this.ARegister
                jumped = true
            }
        }

        if (!jumped) {
            this.PC++
        }

        this.debugCycle(ins)

    }

    this.cycleA = function (ins) {
        this.ARegister = parseInt(ins, 2)
        this.PC++
        this.debugCycle(ins)
    }

    this.loadROM = function (str) {
        var ass = new assembler(str)
        var bin = ass.getAssembledCode()

        var program = bin.split('\n')
        for (i = 0; i < program.length; i++) {
            this.ROM[i] = program[i];
        }
    }
}

module.exports = Hack

},{"hack-assembler":3}],2:[function(require,module,exports){
var symbolTable = {
    'R0': 0,
    'R1': 1,
    'R2': 2,
    'R3': 3,
    'R4': 4,
    'R5': 5,
    'R6': 6,
    'R7': 7,
    'R8': 8,
    'R9': 9,
    'R10': 10,
    'R11': 11,
    'R12': 12,
    'R13': 13,
    'R14': 14,
    'R15': 15,
    'SCREEN': 16384,
    'KBD': 24576,
    'SP': 0,
    'LCL': 1,
    'ARG': 2,
    'THIS': 3,
    'THAT': 4
}

module.exports.symbolTable = symbolTable

var dest = {
    '0':    '000',
    'M':    '001',
    'D':    '010',
    'MD':   '011',
    'A':    '100',
    'AM':   '101',
    'AD':   '110',
    'AMD':  '111'
}

module.exports.dest = dest

var jump = {
    '0':    '000',
    'JGT':  '001',
    'JEQ':  '010',
    'JGE':  '011',
    'JLT':  '100',
    'JNE':  '101',
    'JLE':  '110',
    'JMP':  '111'
}

module.exports.jump = jump

var comp = {
    '0':    '0101010',
    '1':    '0111111',
    '-1':   '0111010',
    'D':    '0001100',
    'A':    '0110000',
    '!D':   '0001101',
    '!A':   '0110001',
    '-D':   '0001111',
    '-A':   '0110011',
    'D+1':  '0011111',
    'A+1':  '0110111',
    'D-1':  '0001110',
    'A-1':  '0110010',
    'D+A':  '0000010',
    'D-A':  '0010011',
    'A-D':  '0000111',
    'D&A':  '0000000',
    'D|A':  '0010101',
    'M':    '1110000',
    '!M':   '1110001',
    '-M':   '1110011',
    'M+1':  '1110111',
    'M-1':  '1110010',
    'D+M':  '1000010',
    'D-M':  '1010011',
    'M-D':  '1000111',
    'D&M':  '1000000',
    'D|M':  '1010101'
}

module.exports.comp = comp
},{}],3:[function(require,module,exports){
var {symbolTable, dest, jump, comp} = require('./constants')

function trimComments(str) {
    var uncommented = str.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
    return uncommented.replace(/^\s+|\s+$/g, '')
}

function assembler(str) {

    // Trim comments
    var str = trimComments(str)

    // Split code array
    var codeAry = str.split('\n')
    var code = {}

    // Move to object  with trimmed values
    codeAry.forEach((element, i) => {
        var line = element.trim()
        if (line) {
            code[i] = element.trim()
        }
    });

    var final = {}
    var labels = {}
    var i = 0;
    
    // Get LOOPS, e.g. (LOOP) and line number
    var regExp = /\(([^)]+)\)/

    for (key in code) {
        var matches = regExp.exec(code[key]);
        if (!matches) {
            final[i++] = code[key];
        } else {
            labels[matches[1]] = parseInt(i)
        }
    }

    // Move labels and code to this
    this.labels = labels
    this.code = final
   
    // Sustitute labels with line number
    this.subLabel = function () {
        for (key in this.code) {
            let line = this.code[key]
            line = line.replace('@', '')
            if (this.labels.hasOwnProperty(line)) {
                this.code[key] = '@' + this.labels[line]
            }
        }
    }

    // Memory start after last register
    this.currentM = 16

    // Add other symbols to symbol table
    this.addSymbolsTotable = function () {
        for (key in this.code) {

            if (this.getOpcode(this.code[key]) === 0) {
                let line = this.code[key]
                line = line.replace('@', '')

                if (!symbolTable.hasOwnProperty(line) && isNaN(line)) {
                    symbolTable[line] = this.currentM
                    this.currentM++
                }
            }
        }
    }

    // Substitute all symbols
    this.subSymbols = function () {
        for (key in this.code) {
            let line = this.code[key]
            line = line.replace('@', '')
            if (symbolTable.hasOwnProperty(line)) {
                this.code[key] = '@' + symbolTable[line]
            }
        }
    }

    // Get opcode
    this.getOpcode = function (line) {
        if (line.startsWith('@')) {
            return 0
        }
        return 1
    }

    // Parse C opcode
    // ixxaccccccdddjjj
    this.parseOpcodeC = function (line) {
        
        var parts = {}

        // Assignment
        var ary = line.split('=')
        if (ary.length > 1) {
            parts['d'] = dest[ary[0]].toString()
            parts['c'] = comp[ary[1]].toString()
            parts['j'] = '000'
        } 

        var ary = line.split(';')
        if (ary.length > 1) {
            parts['c'] = comp[ary[0]].toString()
            parts['d'] = '000' //dest[ary[0]].toString()
            parts['j'] = jump[ary[1]].toString()
        }

        var instruction = '111' + parts['c'] + parts['d'] + parts['j']
        return instruction

    }

    // Parse A opcode
    this.parseOpcodeA = function (line) {
        line = line.replace('@', '')

        var i = parseInt(line)
        var bin = i.toString(2)

        while(bin.length < 16) {
            bin = "0" + bin
        }
        return bin
    }

    // Assemble
    this.getAssembledCode = function () {

        this.subLabel()
        this.addSymbolsTotable()
        this.subSymbols()

        var instructions = ''
        for (key in this.code) {
            let opcode = this.getOpcode(this.code[key])
            if (opcode == 1) {
                instructions +=this.parseOpcodeC(this.code[key]) + '\n'
            } else {
                instructions += this.parseOpcodeA(this.code[key]) + '\n'
            }    
        }
        return instructions.trim()
        
    }

    this.assemble = function () {
        var instructions = this.getAssembledCode()
        console.log(instructions)
    }
}

module.exports = assembler

},{"./constants":2}],4:[function(require,module,exports){
var Hack = require('./index')

window.onload = () => {

    // Hack special keys compared to ascii
    var keys = {
        13: 128,
        8: 129,
        37: 130,
        38: 131,
        39: 132,
        40: 133,
        36: 134,
        35: 135,
        33: 136,
        24: 137,
        45: 138,
        46: 139,
        27: 140,
        112: 141,
        113: 142,
        114: 143,
        115: 144,
        116: 145,
        117: 146,
        118: 147,
        119: 148,
        120: 149,
        121: 150,
        122: 151,
        123: 152
    }

    function handkeKeyDown(e) {
        var keyCode = parseInt(e.keyCode)
        if (keyCode in keys) {
            keyCode = keys[keyCode]
        }
        hack.RAM[24576] = keyCode
    }

    function handkeKeyUp() {
        hack.RAM[24576] = 0
    }

    var hack
    var intervalID
    var running = false
    var opcodes = parseInt(document.getElementById('opcodes').value)
    var milli = parseInt(document.getElementById('milli').value)

    document.getElementById('opcodes').addEventListener('input', function (e) {
        opcodes = this.value
    })

    document.getElementById('milli').addEventListener('input', function (e) {
        milli = this.value
    })

    document.getElementById("run").addEventListener("click", () => {

        if (running) {
            window.removeEventListener("keydown", handkeKeyDown, true)
            window.removeEventListener("keyup", handkeKeyUp, true)
            stopAnimation()
            clearInterval(intervalID)
            running = false
        }

        var asm = document.getElementById('asm').value
        setupHack(asm)
    })

    document.getElementById("stop").addEventListener("click", () => {
        if (running) {
            window.removeEventListener("keydown", handkeKeyDown, true)
            window.removeEventListener("keyup", handkeKeyUp, true)
            stopAnimation()
            clearInterval(intervalID)
            hack = null
            running = false
        }
    })

    function setupHack(asm) {

        if (running) {
            return
        }

        hack = new Hack()
        hack.CANVAS = document.getElementById("screen")
        hack.CANVAS_CTX = hack.CANVAS.getContext("2d")
        hack.CANVAS_DATA = hack.CANVAS_CTX.getImageData(0, 0, hack.CANVAS.width, hack.CANVAS.height)
        hack.loadROM(asm)
        hack.debug = 0

        intervalID = setInterval(function () {
            for (var i = 0; i < opcodes; i++) {
                hack.cycle()
            }

            if (hack.cyclesDone % 100000 == 0) {
                document.getElementById('numOpcodes').innerHTML = hack.cyclesDone
            }
        }, milli)

        window.addEventListener("keydown", handkeKeyDown)
        window.addEventListener("keyup", handkeKeyUp)

        startAnmation()
        running = true
    }

    var requestId

    function loopAnimation(time) {
        requestId = undefined
        hack.updateCanvas()
        startAnmation();
    }

    function startAnmation() {
        if (!requestId) {
            requestId = requestAnimationFrame(loopAnimation);
        }
    }

    function stopAnimation() {
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = undefined;
        }
    }
}

},{"./index":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYWNrLWFzc2VtYmxlci9jb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvaGFjay1hc3NlbWJsZXIvaW5kZXguanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQXMgdGhlIGhhY2sgY29tcHV0ZXIgaXMgcXVpdGUgc21hbGxcbiAqIEV2ZXJ5dGhpbmcgaXMgcGxhY2VkIGluIHRoaXMgZmlsZVxuICogQ1BVLCBSQU0sIFJPTSwgU2NyZWVuLCBLZXlib2FyZFxuICovXG5cbnZhciBhc3NlbWJsZXIgPSByZXF1aXJlKCdoYWNrLWFzc2VtYmxlcicpXG5cbmZ1bmN0aW9uIEhhY2soKSB7XG5cbiAgICB0aGlzLlJPTSA9IG5ldyBBcnJheSgzMjc2NyArIDEpIC8vIDB4MDAwMCB0byAweDgwMDBcbiAgICB0aGlzLlJBTSA9IG5ldyBBcnJheSgyNDU3NiArIDEpIC8vIDB4MDAwMCB0byAweDYwMDBcbiAgICB0aGlzLlJBTS5maWxsKDApXG5cbiAgICB0aGlzLktCRCA9IDI0NTc2ICAgIC8vIEtleWJvYXJkIHBvc2l0aW9uIGluIDB4NjAwMFxuICAgIHRoaXMuUEMgPSAwXG4gICAgdGhpcy5EUmVnaXN0ZXIgPSAwXG4gICAgdGhpcy5BUmVnaXN0ZXIgPSAwXG5cbiAgICB0aGlzLmNvbXAgPSB7XG4gICAgICAgIC8vICcwMTAxMDEwJzogJzAnLFxuICAgICAgICAnMDEwMTAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTExMTExJzogJzEnLFxuICAgICAgICAnMDExMTExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTExMDEwJzogJy0xJyxcbiAgICAgICAgJzAxMTEwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDExMDAnOiAnRCcsXG4gICAgICAgICcwMDAxMTAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDAwJzogJ0EnLFxuICAgICAgICAnMDExMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMTEwMSc6ICchRCcsXG4gICAgICAgICcwMDAxMTAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIH50aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDAwMSc6ICchQScsXG4gICAgICAgICcwMTEwMDAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIH50aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMTExMSc6ICctRCcsXG4gICAgICAgICcwMDAxMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC10aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDAxMSc6ICctQScsXG4gICAgICAgICcwMTEwMDExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC10aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAxMTExMSc6ICdEKzEnLFxuICAgICAgICAnMDAxMTExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciArIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAxMTEnOiAnQSsxJyxcbiAgICAgICAgJzAxMTAxMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5BUmVnaXN0ZXIgKyAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTEwJzogJ0QtMScsXG4gICAgICAgICcwMDAxMTEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIC0gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDAxMCc6ICdBLTEnLFxuICAgICAgICAnMDExMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFSZWdpc3RlciAtIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDAwMTAnOiAnRCtBJyxcbiAgICAgICAgJzAwMDAwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgKyB0aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAxMDAxMSc6ICdELUEnLFxuICAgICAgICAnMDAxMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAtIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAwMTExJzogJ0EtRCcsXG4gICAgICAgICcwMDAwMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyIC0gdGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDAwMDAnOiAnRCZBJyxcbiAgICAgICAgJzAwMDAwMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgJiB0aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAxMDEwMSc6ICdEfEEnLFxuICAgICAgICAnMDAxMDEwMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciB8IHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMDAwJzogJ00nLFxuICAgICAgICAnMTExMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMDEnOiAnIU0nLFxuICAgICAgICAnMTExMDAwMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB+dGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMDExJzogJy1NJyxcbiAgICAgICAgJzExMTAwMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLXRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDExMSc6ICdNKzEnLFxuICAgICAgICAnMTExMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gKyAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMDEwJzogJ00tMScsXG4gICAgICAgICcxMTEwMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXSAtIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMDAwMTAnOiAnRCtNJyxcbiAgICAgICAgJzEwMDAwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgKyB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMTAwMTEnOiAnRC1NJyxcbiAgICAgICAgJzEwMTAwMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgLSB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMDAxMTEnOiAnTS1EJyxcbiAgICAgICAgJzEwMDAxMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdIC0gdGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMDAwMDAnOiAnRCZNJyxcbiAgICAgICAgJzEwMDAwMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgJiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMTAxMDEnOiAnRHxNJ1xuICAgICAgICAnMTAxMDEwMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciB8IHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVzdGluYXRpb25cbiAgICB0aGlzLmRlc3QgPSB7XG4gICAgICAgIC8vICcwMDAnOiAnMCcsXG4gICAgICAgICcwMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAvLyBEbyBub3RoaW5nXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEnOiAnTScsXG4gICAgICAgICcwMDEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTAnOiAnRCcsXG4gICAgICAgICcwMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkRSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExJzogJ01EJyxcbiAgICAgICAgJzAxMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAnOiAnQScsXG4gICAgICAgICcxMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxJzogJ0FNJyxcbiAgICAgICAgJzEwMSc6ICh2YWwpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5zZXRSQU0odmFsKVxuICAgICAgICAgICAgdGhpcy5BUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMCc6ICdBRCcsXG4gICAgICAgICcxMTAnOiAodmFsKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExJzogJ0FNRCdcbiAgICAgICAgJzExMSc6ICh2YWwpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5EUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgICAgIHRoaXMuc2V0UkFNKHZhbClcbiAgICAgICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmp1bXAgPSB7XG4gICAgICAgIC8vICcwMDAnOiAnMCcsXG4gICAgICAgICcwMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMSc6ICdKR1QnLFxuICAgICAgICAnMDAxJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDEwJzogJ0pFUScsXG4gICAgICAgICcwMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExJzogJ0pHRScsXG4gICAgICAgICcwMTEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwJzogJ0pMVCcsXG4gICAgICAgICcxMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDEnOiAnSk5FJyxcbiAgICAgICAgJzEwMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgIT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTAnOiAnSkxFJyxcbiAgICAgICAgJzExMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEnOiAnSk1QJ1xuICAgICAgICAnMTExJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gU2NyZWVuXG4gICAgdGhpcy5TSVpFX0JJVFMgPSA1MTIgKiAyNTZcbiAgICB0aGlzLlNJWkVfV09SRFMgPSB0aGlzLlNJWkVfQklUUyAvIDE2XG4gICAgdGhpcy5TQ1JFRU5fUkFNID0gMTYzODRcblxuICAgIHRoaXMuQ0FOVkFTID0gbnVsbFxuICAgIHRoaXMuQ0FOVkFTX0NUWCA9IG51bGxcbiAgICB0aGlzLkNBTlZBU19EQVRBID0gbnVsbFxuXG4gICAgZnVuY3Rpb24gZ2V0QmluVmFsKGkpIHtcbiAgICAgICAgdmFyIGJpbiA9IGkudG9TdHJpbmcoMilcbiAgICAgICAgd2hpbGUgKGJpbi5sZW5ndGggPCAzMikge1xuICAgICAgICAgICAgYmluID0gXCIwXCIgKyBiaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmluXG4gICAgfVxuXG4gICAgLy8gVXNlZCBmb3IgdGhlIHNjcmVlblxuICAgIC8vIFNjcmVlbiBvcGVyYXRlcyBiaXQgcGF0dGVybnNcbiAgICAvLyAxIGlzIG9uIDAgaXMgb2ZmXG4gICAgZnVuY3Rpb24gZGVjMmJpbihkZWMpIHtcbiAgICAgICAgdmFyIGJpbiA9IChkZWMgPj4+IDApLnRvU3RyaW5nKDIpXG4gICAgICAgIHZhciBiaXQzMiA9IGdldEJpblZhbChiaW4pXG4gICAgICAgIHJldHVybiBiaXQzMi5zdWJzdHJpbmcoMTYsIDMyKVxuXG4gICAgfVxuXG4gICAgLy8gR2V0IFggYW5kIFkgcG9zaXRpb24gb2YgdGhlIHdvcmQgb24gdGhlIGltYWdlXG4gICAgLy8gQWNjb3JkaW5nIHRvIHRoZSBwb3NpdGlvbiBpbiBSQU1cbiAgICAvLyBSQU1bMTYzODQgKyByKjMyICsgYyUxNl1cbiAgICB0aGlzLmdldEltYWdlUm93Q29sdW1uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbnVtV29yZCA9IHRoaXMuQVJlZ2lzdGVyIC0gdGhpcy5TQ1JFRU5fUkFNXG5cbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKG51bVdvcmQgKiAxNiAvIDUxMilcbiAgICAgICAgdmFyIHggPSBudW1Xb3JkICogMTYgJSA1MTJcblxuICAgICAgICB2YXIgeHkgPSB7IHg6IHgsIHk6IHkgfVxuXG4gICAgICAgIHJldHVybiB4eVxuICAgIH1cblxuICAgIC8vIERyYXcgcGl4ZWwgb24gY2FudmFzXG4gICAgdGhpcy5kcmF3UGl4ZWwgPSBmdW5jdGlvbiAoeCwgeSwgciwgZywgYiwgYSkge1xuXG4gICAgICAgIHZhciBpbmRleCA9ICh4ICsgeSAqIHRoaXMuQ0FOVkFTLndpZHRoKSAqIDQ7XG5cbiAgICAgICAgdGhpcy5DQU5WQVNfREFUQS5kYXRhW2luZGV4ICsgMF0gPSByO1xuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAxXSA9IGc7XG4gICAgICAgIHRoaXMuQ0FOVkFTX0RBVEEuZGF0YVtpbmRleCArIDJdID0gYjtcbiAgICAgICAgdGhpcy5DQU5WQVNfREFUQS5kYXRhW2luZGV4ICsgM10gPSBhO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlSW1hZ2VEYXRhID0gZnVuY3Rpb24gKHZhbCkge1xuXG4gICAgICAgIC8vIGdldCBiaW4gdmFsXG4gICAgICAgIHZhciByb3dDb2x1bW4gPSB0aGlzLmdldEltYWdlUm93Q29sdW1uKClcbiAgICAgICAgdmFyIHggPSByb3dDb2x1bW4ueFxuICAgICAgICB2YXIgeSA9IHJvd0NvbHVtbi55XG5cbiAgICAgICAgdmFyIGJpblZhbCA9IGRlYzJiaW4odmFsKVxuICAgICAgICB2YXIgYmluQXJ5ID0gYmluVmFsLnNwbGl0KCcnKVxuXG4gICAgICAgIGJpbkFyeS5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoZWxlbSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGl4ZWwoeCArIDE2IC0gaSwgeSwgMCwgMCwgMCwgMjU1KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQaXhlbCh4ICsgMTYgLSBpLCB5LCAyNTUsIDI1NSwgMjU1LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLkNBTlZBU19DVFgucHV0SW1hZ2VEYXRhKHRoaXMuQ0FOVkFTX0RBVEEsIDAsIDApO1xuICAgIH1cblxuICAgIC8vIEp1c3QgaW4gb3JkZXIgdG8gdHVybiBvZmYgc2NyZWVuXG4gICAgdGhpcy5zY3JlZW4gPSAxXG5cbiAgICAvLyBTZXQgc2NyZWVuIFJBTSBmb3IgZmFzdCBhY2Nlc3NcbiAgICAvLyBBcyBzY3JlZW4gaXMgdXBkYXRlZCBvZnRlblxuICAgIHRoaXMuc2V0UkFNID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gPSB2YWxcbiAgICAgICAgaWYgKHRoaXMuQVJlZ2lzdGVyID49IHRoaXMuU0NSRUVOX1JBTSAmJiB0aGlzLkFSZWdpc3RlciA8IHRoaXMuS0JEKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zY3JlZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUltYWdlRGF0YSh2YWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbnN0cnVjdGlvbjogaXh4YWNjY2NjY2RkZGpqalxuICAgIC8vIEdldCBvcGNvZGVcbiAgICAvLyAwID0gQyBpbnN0cnVjdGlvbiBcbiAgICAvLyAxID0gQSBpbnN0cnVjdGlvblxuICAgIHRoaXMuZ2V0T3Bjb2RlID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygwLCAxKVxuICAgIH1cblxuICAgIHRoaXMuZ2V0Q29tcCA9IGZ1bmN0aW9uIChpbnMpIHtcbiAgICAgICAgcmV0dXJuIGlucy5zdWJzdHJpbmcoMywgMTApXG4gICAgfVxuXG4gICAgdGhpcy5nZXREZXN0ID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygxMCwgMTMpXG4gICAgfVxuXG4gICAgdGhpcy5nZXRKdW1wID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygxMywgMTYpXG4gICAgfVxuXG4gICAgdGhpcy5kZWJ1Z0N5Y2xlID0gZnVuY3Rpb24gKGlucykge1xuXG4gICAgICAgIGlmICghdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wY29kZSA9IHRoaXMuZ2V0T3Bjb2RlKGlucylcbiAgICAgICAgY29uc29sZS5sb2coJ09wY29kZSAnLCBvcGNvZGUpXG4gICAgICAgIGlmIChvcGNvZGUgPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0ICcsIHBhcnNlSW50KGlucywgMikpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXQgKHZhbHVlKSAnLCB0aGlzLlJBTVtwYXJzZUludChpbnMsIDIpXSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnMgJywgaW5zKVxuICAgICAgICBjb25zb2xlLmxvZygnUEMgJywgdGhpcy5QQylcbiAgICAgICAgY29uc29sZS5sb2coJ0FmdGVyIFBhcnNlJylcblxuICAgICAgICBjb25zb2xlLmxvZygnQUxVT3V0JywgdGhpcy5BTFVPdXQpXG4gICAgICAgIGNvbnNvbGUubG9nKCdBUmVnICcsIHRoaXMuQVJlZ2lzdGVyKVxuICAgICAgICBjb25zb2xlLmxvZygnRFJlZyAnLCB0aGlzLkRSZWdpc3RlcilcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLlJBTS5zbGljZSgwLCAxNikpXG4gICAgICAgIGNvbnNvbGUubG9nKCctLS0nKVxuICAgIH1cblxuICAgIHRoaXMuY3ljbGVzRG9uZSA9IDBcbiAgICB0aGlzLmRlYnVnID0gMFxuXG4gICAgdGhpcy5jeWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UEMgPSB0aGlzLlBDXG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLlJPTVt0aGlzLlBDXSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5zID0gdGhpcy5ST01bdGhpcy5QQ11cblxuICAgICAgICB2YXIgb3Bjb2RlID0gdGhpcy5nZXRPcGNvZGUoaW5zKVxuICAgICAgICBpZiAob3Bjb2RlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVDKGlucylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVBKGlucylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3ljbGVzRG9uZSsrXG4gICAgICAgIGlmICh0aGlzLmN5Y2xlc0RvbmUgJSAxMDAwMDAgPT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN5Y2xlc0RvbmUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlQyA9IGZ1bmN0aW9uIChpbnMpIHtcblxuICAgICAgICB2YXIgY29tcCA9IHRoaXMuZ2V0Q29tcChpbnMpXG4gICAgICAgIHZhciBkZXN0ID0gdGhpcy5nZXREZXN0KGlucylcbiAgICAgICAgdmFyIGp1bXAgPSB0aGlzLmdldEp1bXAoaW5zKVxuICAgICAgICB2YXIganVtcGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgQUxVT3V0ID0gdGhpcy5jb21wW2NvbXBdKClcbiAgICAgICAgdGhpcy5BTFVPdXQgPSBBTFVPdXRcblxuICAgICAgICBpZiAoZGVzdCAhPSAnMDAwJykge1xuICAgICAgICAgICAgdGhpcy5kZXN0W2Rlc3RdKEFMVU91dClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChqdW1wICE9ICcwMDAnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5qdW1wW2p1bXBdKEFMVU91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLlBDID0gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgICAgICAgICBqdW1wZWQgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWp1bXBlZCkge1xuICAgICAgICAgICAgdGhpcy5QQysrXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRlYnVnQ3ljbGUoaW5zKVxuXG4gICAgfVxuXG4gICAgdGhpcy5jeWNsZUEgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gcGFyc2VJbnQoaW5zLCAyKVxuICAgICAgICB0aGlzLlBDKytcbiAgICAgICAgdGhpcy5kZWJ1Z0N5Y2xlKGlucylcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRST00gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBhc3MgPSBuZXcgYXNzZW1ibGVyKHN0cilcbiAgICAgICAgdmFyIGJpbiA9IGFzcy5nZXRBc3NlbWJsZWRDb2RlKClcblxuICAgICAgICB2YXIgcHJvZ3JhbSA9IGJpbi5zcGxpdCgnXFxuJylcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHByb2dyYW0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuUk9NW2ldID0gcHJvZ3JhbVtpXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIYWNrXG4iLCJ2YXIgc3ltYm9sVGFibGUgPSB7XG4gICAgJ1IwJzogMCxcbiAgICAnUjEnOiAxLFxuICAgICdSMic6IDIsXG4gICAgJ1IzJzogMyxcbiAgICAnUjQnOiA0LFxuICAgICdSNSc6IDUsXG4gICAgJ1I2JzogNixcbiAgICAnUjcnOiA3LFxuICAgICdSOCc6IDgsXG4gICAgJ1I5JzogOSxcbiAgICAnUjEwJzogMTAsXG4gICAgJ1IxMSc6IDExLFxuICAgICdSMTInOiAxMixcbiAgICAnUjEzJzogMTMsXG4gICAgJ1IxNCc6IDE0LFxuICAgICdSMTUnOiAxNSxcbiAgICAnU0NSRUVOJzogMTYzODQsXG4gICAgJ0tCRCc6IDI0NTc2LFxuICAgICdTUCc6IDAsXG4gICAgJ0xDTCc6IDEsXG4gICAgJ0FSRyc6IDIsXG4gICAgJ1RISVMnOiAzLFxuICAgICdUSEFUJzogNFxufVxuXG5tb2R1bGUuZXhwb3J0cy5zeW1ib2xUYWJsZSA9IHN5bWJvbFRhYmxlXG5cbnZhciBkZXN0ID0ge1xuICAgICcwJzogICAgJzAwMCcsXG4gICAgJ00nOiAgICAnMDAxJyxcbiAgICAnRCc6ICAgICcwMTAnLFxuICAgICdNRCc6ICAgJzAxMScsXG4gICAgJ0EnOiAgICAnMTAwJyxcbiAgICAnQU0nOiAgICcxMDEnLFxuICAgICdBRCc6ICAgJzExMCcsXG4gICAgJ0FNRCc6ICAnMTExJ1xufVxuXG5tb2R1bGUuZXhwb3J0cy5kZXN0ID0gZGVzdFxuXG52YXIganVtcCA9IHtcbiAgICAnMCc6ICAgICcwMDAnLFxuICAgICdKR1QnOiAgJzAwMScsXG4gICAgJ0pFUSc6ICAnMDEwJyxcbiAgICAnSkdFJzogICcwMTEnLFxuICAgICdKTFQnOiAgJzEwMCcsXG4gICAgJ0pORSc6ICAnMTAxJyxcbiAgICAnSkxFJzogICcxMTAnLFxuICAgICdKTVAnOiAgJzExMSdcbn1cblxubW9kdWxlLmV4cG9ydHMuanVtcCA9IGp1bXBcblxudmFyIGNvbXAgPSB7XG4gICAgJzAnOiAgICAnMDEwMTAxMCcsXG4gICAgJzEnOiAgICAnMDExMTExMScsXG4gICAgJy0xJzogICAnMDExMTAxMCcsXG4gICAgJ0QnOiAgICAnMDAwMTEwMCcsXG4gICAgJ0EnOiAgICAnMDExMDAwMCcsXG4gICAgJyFEJzogICAnMDAwMTEwMScsXG4gICAgJyFBJzogICAnMDExMDAwMScsXG4gICAgJy1EJzogICAnMDAwMTExMScsXG4gICAgJy1BJzogICAnMDExMDAxMScsXG4gICAgJ0QrMSc6ICAnMDAxMTExMScsXG4gICAgJ0ErMSc6ICAnMDExMDExMScsXG4gICAgJ0QtMSc6ICAnMDAwMTExMCcsXG4gICAgJ0EtMSc6ICAnMDExMDAxMCcsXG4gICAgJ0QrQSc6ICAnMDAwMDAxMCcsXG4gICAgJ0QtQSc6ICAnMDAxMDAxMScsXG4gICAgJ0EtRCc6ICAnMDAwMDExMScsXG4gICAgJ0QmQSc6ICAnMDAwMDAwMCcsXG4gICAgJ0R8QSc6ICAnMDAxMDEwMScsXG4gICAgJ00nOiAgICAnMTExMDAwMCcsXG4gICAgJyFNJzogICAnMTExMDAwMScsXG4gICAgJy1NJzogICAnMTExMDAxMScsXG4gICAgJ00rMSc6ICAnMTExMDExMScsXG4gICAgJ00tMSc6ICAnMTExMDAxMCcsXG4gICAgJ0QrTSc6ICAnMTAwMDAxMCcsXG4gICAgJ0QtTSc6ICAnMTAxMDAxMScsXG4gICAgJ00tRCc6ICAnMTAwMDExMScsXG4gICAgJ0QmTSc6ICAnMTAwMDAwMCcsXG4gICAgJ0R8TSc6ICAnMTAxMDEwMSdcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tcCA9IGNvbXAiLCJ2YXIge3N5bWJvbFRhYmxlLCBkZXN0LCBqdW1wLCBjb21wfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcblxuZnVuY3Rpb24gdHJpbUNvbW1lbnRzKHN0cikge1xuICAgIHZhciB1bmNvbW1lbnRlZCA9IHN0ci5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvfChbXlxcXFw6XXxeKVxcL1xcLy4qJC9nbSwgJyQxJylcbiAgICByZXR1cm4gdW5jb21tZW50ZWQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlcihzdHIpIHtcblxuICAgIC8vIFRyaW0gY29tbWVudHNcbiAgICB2YXIgc3RyID0gdHJpbUNvbW1lbnRzKHN0cilcblxuICAgIC8vIFNwbGl0IGNvZGUgYXJyYXlcbiAgICB2YXIgY29kZUFyeSA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICB2YXIgY29kZSA9IHt9XG5cbiAgICAvLyBNb3ZlIHRvIG9iamVjdCAgd2l0aCB0cmltbWVkIHZhbHVlc1xuICAgIGNvZGVBcnkuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuICAgICAgICB2YXIgbGluZSA9IGVsZW1lbnQudHJpbSgpXG4gICAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgICAgICBjb2RlW2ldID0gZWxlbWVudC50cmltKClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGZpbmFsID0ge31cbiAgICB2YXIgbGFiZWxzID0ge31cbiAgICB2YXIgaSA9IDA7XG4gICAgXG4gICAgLy8gR2V0IExPT1BTLCBlLmcuIChMT09QKSBhbmQgbGluZSBudW1iZXJcbiAgICB2YXIgcmVnRXhwID0gL1xcKChbXildKylcXCkvXG5cbiAgICBmb3IgKGtleSBpbiBjb2RlKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gcmVnRXhwLmV4ZWMoY29kZVtrZXldKTtcbiAgICAgICAgaWYgKCFtYXRjaGVzKSB7XG4gICAgICAgICAgICBmaW5hbFtpKytdID0gY29kZVtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFiZWxzW21hdGNoZXNbMV1dID0gcGFyc2VJbnQoaSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1vdmUgbGFiZWxzIGFuZCBjb2RlIHRvIHRoaXNcbiAgICB0aGlzLmxhYmVscyA9IGxhYmVsc1xuICAgIHRoaXMuY29kZSA9IGZpbmFsXG4gICBcbiAgICAvLyBTdXN0aXR1dGUgbGFiZWxzIHdpdGggbGluZSBudW1iZXJcbiAgICB0aGlzLnN1YkxhYmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcbiAgICAgICAgICAgIGlmICh0aGlzLmxhYmVscy5oYXNPd25Qcm9wZXJ0eShsaW5lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29kZVtrZXldID0gJ0AnICsgdGhpcy5sYWJlbHNbbGluZV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1lbW9yeSBzdGFydCBhZnRlciBsYXN0IHJlZ2lzdGVyXG4gICAgdGhpcy5jdXJyZW50TSA9IDE2XG5cbiAgICAvLyBBZGQgb3RoZXIgc3ltYm9scyB0byBzeW1ib2wgdGFibGVcbiAgICB0aGlzLmFkZFN5bWJvbHNUb3RhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0T3Bjb2RlKHRoaXMuY29kZVtrZXldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdAJywgJycpXG5cbiAgICAgICAgICAgICAgICBpZiAoIXN5bWJvbFRhYmxlLmhhc093blByb3BlcnR5KGxpbmUpICYmIGlzTmFOKGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbFRhYmxlW2xpbmVdID0gdGhpcy5jdXJyZW50TVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNKytcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdWJzdGl0dXRlIGFsbCBzeW1ib2xzXG4gICAgdGhpcy5zdWJTeW1ib2xzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcbiAgICAgICAgICAgIGlmIChzeW1ib2xUYWJsZS5oYXNPd25Qcm9wZXJ0eShsaW5lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29kZVtrZXldID0gJ0AnICsgc3ltYm9sVGFibGVbbGluZV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldCBvcGNvZGVcbiAgICB0aGlzLmdldE9wY29kZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0AnKSkge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIC8vIFBhcnNlIEMgb3Bjb2RlXG4gICAgLy8gaXh4YWNjY2NjY2RkZGpqalxuICAgIHRoaXMucGFyc2VPcGNvZGVDID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBwYXJ0cyA9IHt9XG5cbiAgICAgICAgLy8gQXNzaWdubWVudFxuICAgICAgICB2YXIgYXJ5ID0gbGluZS5zcGxpdCgnPScpXG4gICAgICAgIGlmIChhcnkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcGFydHNbJ2QnXSA9IGRlc3RbYXJ5WzBdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snYyddID0gY29tcFthcnlbMV1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydqJ10gPSAnMDAwJ1xuICAgICAgICB9IFxuXG4gICAgICAgIHZhciBhcnkgPSBsaW5lLnNwbGl0KCc7JylcbiAgICAgICAgaWYgKGFyeS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBwYXJ0c1snYyddID0gY29tcFthcnlbMF1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydkJ10gPSAnMDAwJyAvL2Rlc3RbYXJ5WzBdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snaiddID0ganVtcFthcnlbMV1dLnRvU3RyaW5nKClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnN0cnVjdGlvbiA9ICcxMTEnICsgcGFydHNbJ2MnXSArIHBhcnRzWydkJ10gKyBwYXJ0c1snaiddXG4gICAgICAgIHJldHVybiBpbnN0cnVjdGlvblxuXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgQSBvcGNvZGVcbiAgICB0aGlzLnBhcnNlT3Bjb2RlQSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcblxuICAgICAgICB2YXIgaSA9IHBhcnNlSW50KGxpbmUpXG4gICAgICAgIHZhciBiaW4gPSBpLnRvU3RyaW5nKDIpXG5cbiAgICAgICAgd2hpbGUoYmluLmxlbmd0aCA8IDE2KSB7XG4gICAgICAgICAgICBiaW4gPSBcIjBcIiArIGJpblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiaW5cbiAgICB9XG5cbiAgICAvLyBBc3NlbWJsZVxuICAgIHRoaXMuZ2V0QXNzZW1ibGVkQ29kZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB0aGlzLnN1YkxhYmVsKClcbiAgICAgICAgdGhpcy5hZGRTeW1ib2xzVG90YWJsZSgpXG4gICAgICAgIHRoaXMuc3ViU3ltYm9scygpXG5cbiAgICAgICAgdmFyIGluc3RydWN0aW9ucyA9ICcnXG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMuY29kZSkge1xuICAgICAgICAgICAgbGV0IG9wY29kZSA9IHRoaXMuZ2V0T3Bjb2RlKHRoaXMuY29kZVtrZXldKVxuICAgICAgICAgICAgaWYgKG9wY29kZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zICs9dGhpcy5wYXJzZU9wY29kZUModGhpcy5jb2RlW2tleV0pICsgJ1xcbidcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zICs9IHRoaXMucGFyc2VPcGNvZGVBKHRoaXMuY29kZVtrZXldKSArICdcXG4nXG4gICAgICAgICAgICB9ICAgIFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0cnVjdGlvbnMudHJpbSgpXG4gICAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuYXNzZW1ibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnN0cnVjdGlvbnMgPSB0aGlzLmdldEFzc2VtYmxlZENvZGUoKVxuICAgICAgICBjb25zb2xlLmxvZyhpbnN0cnVjdGlvbnMpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2VtYmxlclxuIiwidmFyIEhhY2sgPSByZXF1aXJlKCcuL2luZGV4Jylcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcblxuICAgIC8vIEhhY2sgc3BlY2lhbCBrZXlzIGNvbXBhcmVkIHRvIGFzY2lpXG4gICAgdmFyIGtleXMgPSB7XG4gICAgICAgIDEzOiAxMjgsXG4gICAgICAgIDg6IDEyOSxcbiAgICAgICAgMzc6IDEzMCxcbiAgICAgICAgMzg6IDEzMSxcbiAgICAgICAgMzk6IDEzMixcbiAgICAgICAgNDA6IDEzMyxcbiAgICAgICAgMzY6IDEzNCxcbiAgICAgICAgMzU6IDEzNSxcbiAgICAgICAgMzM6IDEzNixcbiAgICAgICAgMjQ6IDEzNyxcbiAgICAgICAgNDU6IDEzOCxcbiAgICAgICAgNDY6IDEzOSxcbiAgICAgICAgMjc6IDE0MCxcbiAgICAgICAgMTEyOiAxNDEsXG4gICAgICAgIDExMzogMTQyLFxuICAgICAgICAxMTQ6IDE0MyxcbiAgICAgICAgMTE1OiAxNDQsXG4gICAgICAgIDExNjogMTQ1LFxuICAgICAgICAxMTc6IDE0NixcbiAgICAgICAgMTE4OiAxNDcsXG4gICAgICAgIDExOTogMTQ4LFxuICAgICAgICAxMjA6IDE0OSxcbiAgICAgICAgMTIxOiAxNTAsXG4gICAgICAgIDEyMjogMTUxLFxuICAgICAgICAxMjM6IDE1MlxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRrZUtleURvd24oZSkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IHBhcnNlSW50KGUua2V5Q29kZSlcbiAgICAgICAgaWYgKGtleUNvZGUgaW4ga2V5cykge1xuICAgICAgICAgICAga2V5Q29kZSA9IGtleXNba2V5Q29kZV1cbiAgICAgICAgfVxuICAgICAgICBoYWNrLlJBTVsyNDU3Nl0gPSBrZXlDb2RlXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGtlS2V5VXAoKSB7XG4gICAgICAgIGhhY2suUkFNWzI0NTc2XSA9IDBcbiAgICB9XG5cbiAgICB2YXIgaGFja1xuICAgIHZhciBpbnRlcnZhbElEXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZVxuICAgIHZhciBvcGNvZGVzID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wY29kZXMnKS52YWx1ZSlcbiAgICB2YXIgbWlsbGkgPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlsbGknKS52YWx1ZSlcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGNvZGVzJykuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBvcGNvZGVzID0gdGhpcy52YWx1ZVxuICAgIH0pXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlsbGknKS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIG1pbGxpID0gdGhpcy52YWx1ZVxuICAgIH0pXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJ1blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXG4gICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGtlS2V5RG93biwgdHJ1ZSlcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgaGFuZGtlS2V5VXAsIHRydWUpXG4gICAgICAgICAgICBzdG9wQW5pbWF0aW9uKClcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRClcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFzbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc20nKS52YWx1ZVxuICAgICAgICBzZXR1cEhhY2soYXNtKVxuICAgIH0pXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5ka2VLZXlEb3duLCB0cnVlKVxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBoYW5ka2VLZXlVcCwgdHJ1ZSlcbiAgICAgICAgICAgIHN0b3BBbmltYXRpb24oKVxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElEKVxuICAgICAgICAgICAgaGFjayA9IG51bGxcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIGZ1bmN0aW9uIHNldHVwSGFjayhhc20pIHtcblxuICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBoYWNrID0gbmV3IEhhY2soKVxuICAgICAgICBoYWNrLkNBTlZBUyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NyZWVuXCIpXG4gICAgICAgIGhhY2suQ0FOVkFTX0NUWCA9IGhhY2suQ0FOVkFTLmdldENvbnRleHQoXCIyZFwiKVxuICAgICAgICBoYWNrLkNBTlZBU19EQVRBID0gaGFjay5DQU5WQVNfQ1RYLmdldEltYWdlRGF0YSgwLCAwLCBoYWNrLkNBTlZBUy53aWR0aCwgaGFjay5DQU5WQVMuaGVpZ2h0KVxuICAgICAgICBoYWNrLmxvYWRST00oYXNtKVxuICAgICAgICBoYWNrLmRlYnVnID0gMFxuXG4gICAgICAgIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wY29kZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIGhhY2suY3ljbGUoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGFjay5jeWNsZXNEb25lICUgMTAwMDAwID09IDApIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtT3Bjb2RlcycpLmlubmVySFRNTCA9IGhhY2suY3ljbGVzRG9uZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBtaWxsaSlcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGtlS2V5RG93bilcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBoYW5ka2VLZXlVcClcblxuICAgICAgICBzdGFydEFubWF0aW9uKClcbiAgICAgICAgcnVubmluZyA9IHRydWVcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdElkXG5cbiAgICBmdW5jdGlvbiBsb29wQW5pbWF0aW9uKHRpbWUpIHtcbiAgICAgICAgcmVxdWVzdElkID0gdW5kZWZpbmVkXG4gICAgICAgIGhhY2sudXBkYXRlQ2FudmFzKClcbiAgICAgICAgc3RhcnRBbm1hdGlvbigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0QW5tYXRpb24oKSB7XG4gICAgICAgIGlmICghcmVxdWVzdElkKSB7XG4gICAgICAgICAgICByZXF1ZXN0SWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcEFuaW1hdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wQW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAocmVxdWVzdElkKSB7XG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgcmVxdWVzdElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
