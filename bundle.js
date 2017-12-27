(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * As the hack computer is quite small
 * Everything is placed in this file
 * CPU, RAM, ROM, Screen, Keyboard
 */

var assembler = require('hack-assembler')

function Hack() {

    this.ROM = new Array(32767) // 0x0000 to 0x8000
    this.RAM = new Array(24576) // 0x0000 to 0x6000
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
        var bin = ass.getAssembleCode()

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
    this.getAssembleCode = function () {

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
        var instructions = this.getAssembleCode()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYWNrLWFzc2VtYmxlci9jb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvaGFjay1hc3NlbWJsZXIvaW5kZXguanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQXMgdGhlIGhhY2sgY29tcHV0ZXIgaXMgcXVpdGUgc21hbGxcbiAqIEV2ZXJ5dGhpbmcgaXMgcGxhY2VkIGluIHRoaXMgZmlsZVxuICogQ1BVLCBSQU0sIFJPTSwgU2NyZWVuLCBLZXlib2FyZFxuICovXG5cbnZhciBhc3NlbWJsZXIgPSByZXF1aXJlKCdoYWNrLWFzc2VtYmxlcicpXG5cbmZ1bmN0aW9uIEhhY2soKSB7XG5cbiAgICB0aGlzLlJPTSA9IG5ldyBBcnJheSgzMjc2NykgLy8gMHgwMDAwIHRvIDB4ODAwMFxuICAgIHRoaXMuUkFNID0gbmV3IEFycmF5KDI0NTc2KSAvLyAweDAwMDAgdG8gMHg2MDAwXG4gICAgdGhpcy5SQU0uZmlsbCgwKVxuXG4gICAgdGhpcy5LQkQgPSAyNDU3NiAgICAvLyBLZXlib2FyZCBwb3NpdGlvbiBpbiAweDYwMDBcbiAgICB0aGlzLlBDID0gMFxuICAgIHRoaXMuRFJlZ2lzdGVyID0gMFxuICAgIHRoaXMuQVJlZ2lzdGVyID0gMFxuXG4gICAgdGhpcy5jb21wID0ge1xuICAgICAgICAvLyAnMDEwMTAxMCc6ICcwJyxcbiAgICAgICAgJzAxMDEwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMTExMSc6ICcxJyxcbiAgICAgICAgJzAxMTExMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMTAxMCc6ICctMScsXG4gICAgICAgICcwMTExMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTAwJzogJ0QnLFxuICAgICAgICAnMDAwMTEwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDAwMCc6ICdBJyxcbiAgICAgICAgJzAxMTAwMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDExMDEnOiAnIUQnLFxuICAgICAgICAnMDAwMTEwMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB+dGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAwMDEnOiAnIUEnLFxuICAgICAgICAnMDExMDAwMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB+dGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDExMTEnOiAnLUQnLFxuICAgICAgICAnMDAwMTExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtdGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAwMTEnOiAnLUEnLFxuICAgICAgICAnMDExMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMTExMTEnOiAnRCsxJyxcbiAgICAgICAgJzAwMTExMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgKyAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMTExJzogJ0ErMScsXG4gICAgICAgICcwMTEwMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyICsgMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMTExMCc6ICdELTEnLFxuICAgICAgICAnMDAwMTExMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAtIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAwMTAnOiAnQS0xJyxcbiAgICAgICAgJzAxMTAwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5BUmVnaXN0ZXIgLSAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAwMDEwJzogJ0QrQScsXG4gICAgICAgICcwMDAwMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICsgdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMTAwMTEnOiAnRC1BJyxcbiAgICAgICAgJzAwMTAwMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgLSB0aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMDExMSc6ICdBLUQnLFxuICAgICAgICAnMDAwMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFSZWdpc3RlciAtIHRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAwMDAwJzogJ0QmQScsXG4gICAgICAgICcwMDAwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICYgdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMTAxMDEnOiAnRHxBJyxcbiAgICAgICAgJzAwMTAxMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgfCB0aGlzLkFSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDAwMCc6ICdNJyxcbiAgICAgICAgJzExMTAwMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMDAxJzogJyFNJyxcbiAgICAgICAgJzExMTAwMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gfnRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDAxMSc6ICctTScsXG4gICAgICAgICcxMTEwMDExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC10aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAxMTEnOiAnTSsxJyxcbiAgICAgICAgJzExMTAxMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdICsgMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDAxMCc6ICdNLTEnLFxuICAgICAgICAnMTExMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gLSAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAwMDEwJzogJ0QrTScsXG4gICAgICAgICcxMDAwMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICsgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDEwMDExJzogJ0QtTScsXG4gICAgICAgICcxMDEwMDExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIC0gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAwMTExJzogJ00tRCcsXG4gICAgICAgICcxMDAwMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXSAtIHRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAwMDAwJzogJ0QmTScsXG4gICAgICAgICcxMDAwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICYgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDEwMTAxJzogJ0R8TSdcbiAgICAgICAgJzEwMTAxMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgfCB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlc3RpbmF0aW9uXG4gICAgdGhpcy5kZXN0ID0ge1xuICAgICAgICAvLyAnMDAwJzogJzAnLFxuICAgICAgICAnMDAwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgLy8gRG8gbm90aGluZ1xuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAxJzogJ00nLFxuICAgICAgICAnMDAxJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRSQU0odmFsKVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDEwJzogJ0QnLFxuICAgICAgICAnMDEwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5EUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMSc6ICdNRCcsXG4gICAgICAgICcwMTEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkRSZWdpc3RlciA9IHZhbFxuICAgICAgICAgICAgdGhpcy5zZXRSQU0odmFsKVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwJzogJ0EnLFxuICAgICAgICAnMTAwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5BUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMSc6ICdBTScsXG4gICAgICAgICcxMDEnOiAodmFsKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0UkFNKHZhbClcbiAgICAgICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTAnOiAnQUQnLFxuICAgICAgICAnMTEwJzogKHZhbCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLkRSZWdpc3RlciA9IHZhbFxuICAgICAgICAgICAgdGhpcy5BUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMSc6ICdBTUQnXG4gICAgICAgICcxMTEnOiAodmFsKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qdW1wID0ge1xuICAgICAgICAvLyAnMDAwJzogJzAnLFxuICAgICAgICAnMDAwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEnOiAnSkdUJyxcbiAgICAgICAgJzAwMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMCc6ICdKRVEnLFxuICAgICAgICAnMDEwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMSc6ICdKR0UnLFxuICAgICAgICAnMDExJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMCc6ICdKTFQnLFxuICAgICAgICAnMTAwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxJzogJ0pORScsXG4gICAgICAgICcxMDEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsICE9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTEwJzogJ0pMRScsXG4gICAgICAgICcxMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsIDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExJzogJ0pNUCdcbiAgICAgICAgJzExMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vIFNjcmVlblxuICAgIHRoaXMuU0laRV9CSVRTID0gNTEyICogMjU2XG4gICAgdGhpcy5TSVpFX1dPUkRTID0gdGhpcy5TSVpFX0JJVFMgLyAxNlxuICAgIHRoaXMuU0NSRUVOX1JBTSA9IDE2Mzg0XG5cbiAgICB0aGlzLkNBTlZBUyA9IG51bGxcbiAgICB0aGlzLkNBTlZBU19DVFggPSBudWxsXG4gICAgdGhpcy5DQU5WQVNfREFUQSA9IG51bGxcblxuICAgIGZ1bmN0aW9uIGdldEJpblZhbChpKSB7XG4gICAgICAgIHZhciBiaW4gPSBpLnRvU3RyaW5nKDIpXG4gICAgICAgIHdoaWxlIChiaW4ubGVuZ3RoIDwgMzIpIHtcbiAgICAgICAgICAgIGJpbiA9IFwiMFwiICsgYmluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJpblxuICAgIH1cblxuICAgIC8vIFVzZWQgZm9yIHRoZSBzY3JlZW5cbiAgICAvLyBTY3JlZW4gb3BlcmF0ZXMgYml0IHBhdHRlcm5zXG4gICAgLy8gMSBpcyBvbiAwIGlzIG9mZlxuICAgIGZ1bmN0aW9uIGRlYzJiaW4oZGVjKSB7XG4gICAgICAgIHZhciBiaW4gPSAoZGVjID4+PiAwKS50b1N0cmluZygyKVxuICAgICAgICB2YXIgYml0MzIgPSBnZXRCaW5WYWwoYmluKVxuICAgICAgICByZXR1cm4gYml0MzIuc3Vic3RyaW5nKDE2LCAzMilcblxuICAgIH1cblxuICAgIC8vIEdldCBYIGFuZCBZIHBvc2l0aW9uIG9mIHRoZSB3b3JkIG9uIHRoZSBpbWFnZVxuICAgIC8vIEFjY29yZGluZyB0byB0aGUgcG9zaXRpb24gaW4gUkFNXG4gICAgLy8gUkFNWzE2Mzg0ICsgciozMiArIGMlMTZdXG4gICAgdGhpcy5nZXRJbWFnZVJvd0NvbHVtbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG51bVdvcmQgPSB0aGlzLkFSZWdpc3RlciAtIHRoaXMuU0NSRUVOX1JBTVxuXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihudW1Xb3JkICogMTYgLyA1MTIpXG4gICAgICAgIHZhciB4ID0gbnVtV29yZCAqIDE2ICUgNTEyXG5cbiAgICAgICAgdmFyIHh5ID0geyB4OiB4LCB5OiB5IH1cblxuICAgICAgICByZXR1cm4geHlcbiAgICB9XG5cbiAgICAvLyBEcmF3IHBpeGVsIG9uIGNhbnZhc1xuICAgIHRoaXMuZHJhd1BpeGVsID0gZnVuY3Rpb24gKHgsIHksIHIsIGcsIGIsIGEpIHtcblxuICAgICAgICB2YXIgaW5kZXggPSAoeCArIHkgKiB0aGlzLkNBTlZBUy53aWR0aCkgKiA0O1xuXG4gICAgICAgIHRoaXMuQ0FOVkFTX0RBVEEuZGF0YVtpbmRleCArIDBdID0gcjtcbiAgICAgICAgdGhpcy5DQU5WQVNfREFUQS5kYXRhW2luZGV4ICsgMV0gPSBnO1xuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAyXSA9IGI7XG4gICAgICAgIHRoaXMuQ0FOVkFTX0RBVEEuZGF0YVtpbmRleCArIDNdID0gYTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUltYWdlRGF0YSA9IGZ1bmN0aW9uICh2YWwpIHtcblxuICAgICAgICAvLyBnZXQgYmluIHZhbFxuICAgICAgICB2YXIgcm93Q29sdW1uID0gdGhpcy5nZXRJbWFnZVJvd0NvbHVtbigpXG4gICAgICAgIHZhciB4ID0gcm93Q29sdW1uLnhcbiAgICAgICAgdmFyIHkgPSByb3dDb2x1bW4ueVxuXG4gICAgICAgIHZhciBiaW5WYWwgPSBkZWMyYmluKHZhbClcbiAgICAgICAgdmFyIGJpbkFyeSA9IGJpblZhbC5zcGxpdCgnJylcblxuICAgICAgICBiaW5BcnkuZm9yRWFjaCgoZWxlbSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVsZW0gPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BpeGVsKHggKyAxNiAtIGksIHksIDAsIDAsIDAsIDI1NSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGl4ZWwoeCArIDE2IC0gaSwgeSwgMjU1LCAyNTUsIDI1NSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNhbnZhcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5DQU5WQVNfQ1RYLnB1dEltYWdlRGF0YSh0aGlzLkNBTlZBU19EQVRBLCAwLCAwKTtcbiAgICB9XG5cbiAgICAvLyBKdXN0IGluIG9yZGVyIHRvIHR1cm4gb2ZmIHNjcmVlblxuICAgIHRoaXMuc2NyZWVuID0gMVxuXG4gICAgLy8gU2V0IHNjcmVlbiBSQU0gZm9yIGZhc3QgYWNjZXNzXG4gICAgLy8gQXMgc2NyZWVuIGlzIHVwZGF0ZWQgb2Z0ZW5cbiAgICB0aGlzLnNldFJBTSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdID0gdmFsXG4gICAgICAgIGlmICh0aGlzLkFSZWdpc3RlciA+PSB0aGlzLlNDUkVFTl9SQU0gJiYgdGhpcy5BUmVnaXN0ZXIgPCB0aGlzLktCRCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NyZWVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbWFnZURhdGEodmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5zdHJ1Y3Rpb246IGl4eGFjY2NjY2NkZGRqampcbiAgICAvLyBHZXQgb3Bjb2RlXG4gICAgLy8gMCA9IEMgaW5zdHJ1Y3Rpb24gXG4gICAgLy8gMSA9IEEgaW5zdHJ1Y3Rpb25cbiAgICB0aGlzLmdldE9wY29kZSA9IGZ1bmN0aW9uIChpbnMpIHtcbiAgICAgICAgcmV0dXJuIGlucy5zdWJzdHJpbmcoMCwgMSlcbiAgICB9XG5cbiAgICB0aGlzLmdldENvbXAgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHJldHVybiBpbnMuc3Vic3RyaW5nKDMsIDEwKVxuICAgIH1cblxuICAgIHRoaXMuZ2V0RGVzdCA9IGZ1bmN0aW9uIChpbnMpIHtcbiAgICAgICAgcmV0dXJuIGlucy5zdWJzdHJpbmcoMTAsIDEzKVxuICAgIH1cblxuICAgIHRoaXMuZ2V0SnVtcCA9IGZ1bmN0aW9uIChpbnMpIHtcbiAgICAgICAgcmV0dXJuIGlucy5zdWJzdHJpbmcoMTMsIDE2KVxuICAgIH1cblxuICAgIHRoaXMuZGVidWdDeWNsZSA9IGZ1bmN0aW9uIChpbnMpIHtcblxuICAgICAgICBpZiAoIXRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcGNvZGUgPSB0aGlzLmdldE9wY29kZShpbnMpXG4gICAgICAgIGNvbnNvbGUubG9nKCdPcGNvZGUgJywgb3Bjb2RlKVxuICAgICAgICBpZiAob3Bjb2RlID09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdCAnLCBwYXJzZUludChpbnMsIDIpKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0ICh2YWx1ZSkgJywgdGhpcy5SQU1bcGFyc2VJbnQoaW5zLCAyKV0pXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnSW5zICcsIGlucylcbiAgICAgICAgY29uc29sZS5sb2coJ1BDICcsIHRoaXMuUEMpXG4gICAgICAgIGNvbnNvbGUubG9nKCdBZnRlciBQYXJzZScpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ0FMVU91dCcsIHRoaXMuQUxVT3V0KVxuICAgICAgICBjb25zb2xlLmxvZygnQVJlZyAnLCB0aGlzLkFSZWdpc3RlcilcbiAgICAgICAgY29uc29sZS5sb2coJ0RSZWcgJywgdGhpcy5EUmVnaXN0ZXIpXG5cbiAgICAgICAgY29uc29sZS5sb2codGhpcy5SQU0uc2xpY2UoMCwgMTYpKVxuICAgICAgICBjb25zb2xlLmxvZygnLS0tJylcbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlc0RvbmUgPSAwXG4gICAgdGhpcy5kZWJ1ZyA9IDBcblxuICAgIHRoaXMuY3ljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBDID0gdGhpcy5QQ1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5ST01bdGhpcy5QQ10gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlucyA9IHRoaXMuUk9NW3RoaXMuUENdXG5cbiAgICAgICAgdmFyIG9wY29kZSA9IHRoaXMuZ2V0T3Bjb2RlKGlucylcbiAgICAgICAgaWYgKG9wY29kZSA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmN5Y2xlQyhpbnMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN5Y2xlQShpbnMpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN5Y2xlc0RvbmUrK1xuICAgICAgICBpZiAodGhpcy5jeWNsZXNEb25lICUgMTAwMDAwID09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jeWNsZXNEb25lKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jeWNsZUMgPSBmdW5jdGlvbiAoaW5zKSB7XG5cbiAgICAgICAgdmFyIGNvbXAgPSB0aGlzLmdldENvbXAoaW5zKVxuICAgICAgICB2YXIgZGVzdCA9IHRoaXMuZ2V0RGVzdChpbnMpXG4gICAgICAgIHZhciBqdW1wID0gdGhpcy5nZXRKdW1wKGlucylcbiAgICAgICAgdmFyIGp1bXBlZCA9IGZhbHNlXG5cbiAgICAgICAgdmFyIEFMVU91dCA9IHRoaXMuY29tcFtjb21wXSgpXG4gICAgICAgIHRoaXMuQUxVT3V0ID0gQUxVT3V0XG5cbiAgICAgICAgaWYgKGRlc3QgIT0gJzAwMCcpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdFtkZXN0XShBTFVPdXQpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoanVtcCAhPSAnMDAwJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuanVtcFtqdW1wXShBTFVPdXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5QQyA9IHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgICAgICAgICAganVtcGVkID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFqdW1wZWQpIHtcbiAgICAgICAgICAgIHRoaXMuUEMrK1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kZWJ1Z0N5Y2xlKGlucylcblxuICAgIH1cblxuICAgIHRoaXMuY3ljbGVBID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHBhcnNlSW50KGlucywgMilcbiAgICAgICAgdGhpcy5QQysrXG4gICAgICAgIHRoaXMuZGVidWdDeWNsZShpbnMpXG4gICAgfVxuXG4gICAgdGhpcy5sb2FkUk9NID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgYXNzID0gbmV3IGFzc2VtYmxlcihzdHIpXG4gICAgICAgIHZhciBiaW4gPSBhc3MuZ2V0QXNzZW1ibGVDb2RlKClcblxuICAgICAgICB2YXIgcHJvZ3JhbSA9IGJpbi5zcGxpdCgnXFxuJylcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHByb2dyYW0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuUk9NW2ldID0gcHJvZ3JhbVtpXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIYWNrXG4iLCJ2YXIgc3ltYm9sVGFibGUgPSB7XG4gICAgJ1IwJzogMCxcbiAgICAnUjEnOiAxLFxuICAgICdSMic6IDIsXG4gICAgJ1IzJzogMyxcbiAgICAnUjQnOiA0LFxuICAgICdSNSc6IDUsXG4gICAgJ1I2JzogNixcbiAgICAnUjcnOiA3LFxuICAgICdSOCc6IDgsXG4gICAgJ1I5JzogOSxcbiAgICAnUjEwJzogMTAsXG4gICAgJ1IxMSc6IDExLFxuICAgICdSMTInOiAxMixcbiAgICAnUjEzJzogMTMsXG4gICAgJ1IxNCc6IDE0LFxuICAgICdSMTUnOiAxNSxcbiAgICAnU0NSRUVOJzogMTYzODQsXG4gICAgJ0tCRCc6IDI0NTc2LFxuICAgICdTUCc6IDAsXG4gICAgJ0xDTCc6IDEsXG4gICAgJ0FSRyc6IDIsXG4gICAgJ1RISVMnOiAzLFxuICAgICdUSEFUJzogNFxufVxuXG5tb2R1bGUuZXhwb3J0cy5zeW1ib2xUYWJsZSA9IHN5bWJvbFRhYmxlXG5cbnZhciBkZXN0ID0ge1xuICAgICcwJzogICAgJzAwMCcsXG4gICAgJ00nOiAgICAnMDAxJyxcbiAgICAnRCc6ICAgICcwMTAnLFxuICAgICdNRCc6ICAgJzAxMScsXG4gICAgJ0EnOiAgICAnMTAwJyxcbiAgICAnQU0nOiAgICcxMDEnLFxuICAgICdBRCc6ICAgJzExMCcsXG4gICAgJ0FNRCc6ICAnMTExJ1xufVxuXG5tb2R1bGUuZXhwb3J0cy5kZXN0ID0gZGVzdFxuXG52YXIganVtcCA9IHtcbiAgICAnMCc6ICAgICcwMDAnLFxuICAgICdKR1QnOiAgJzAwMScsXG4gICAgJ0pFUSc6ICAnMDEwJyxcbiAgICAnSkdFJzogICcwMTEnLFxuICAgICdKTFQnOiAgJzEwMCcsXG4gICAgJ0pORSc6ICAnMTAxJyxcbiAgICAnSkxFJzogICcxMTAnLFxuICAgICdKTVAnOiAgJzExMSdcbn1cblxubW9kdWxlLmV4cG9ydHMuanVtcCA9IGp1bXBcblxudmFyIGNvbXAgPSB7XG4gICAgJzAnOiAgICAnMDEwMTAxMCcsXG4gICAgJzEnOiAgICAnMDExMTExMScsXG4gICAgJy0xJzogICAnMDExMTAxMCcsXG4gICAgJ0QnOiAgICAnMDAwMTEwMCcsXG4gICAgJ0EnOiAgICAnMDExMDAwMCcsXG4gICAgJyFEJzogICAnMDAwMTEwMScsXG4gICAgJyFBJzogICAnMDExMDAwMScsXG4gICAgJy1EJzogICAnMDAwMTExMScsXG4gICAgJy1BJzogICAnMDExMDAxMScsXG4gICAgJ0QrMSc6ICAnMDAxMTExMScsXG4gICAgJ0ErMSc6ICAnMDExMDExMScsXG4gICAgJ0QtMSc6ICAnMDAwMTExMCcsXG4gICAgJ0EtMSc6ICAnMDExMDAxMCcsXG4gICAgJ0QrQSc6ICAnMDAwMDAxMCcsXG4gICAgJ0QtQSc6ICAnMDAxMDAxMScsXG4gICAgJ0EtRCc6ICAnMDAwMDExMScsXG4gICAgJ0QmQSc6ICAnMDAwMDAwMCcsXG4gICAgJ0R8QSc6ICAnMDAxMDEwMScsXG4gICAgJ00nOiAgICAnMTExMDAwMCcsXG4gICAgJyFNJzogICAnMTExMDAwMScsXG4gICAgJy1NJzogICAnMTExMDAxMScsXG4gICAgJ00rMSc6ICAnMTExMDExMScsXG4gICAgJ00tMSc6ICAnMTExMDAxMCcsXG4gICAgJ0QrTSc6ICAnMTAwMDAxMCcsXG4gICAgJ0QtTSc6ICAnMTAxMDAxMScsXG4gICAgJ00tRCc6ICAnMTAwMDExMScsXG4gICAgJ0QmTSc6ICAnMTAwMDAwMCcsXG4gICAgJ0R8TSc6ICAnMTAxMDEwMSdcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tcCA9IGNvbXAiLCJ2YXIge3N5bWJvbFRhYmxlLCBkZXN0LCBqdW1wLCBjb21wfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcblxuZnVuY3Rpb24gdHJpbUNvbW1lbnRzKHN0cikge1xuICAgIHZhciB1bmNvbW1lbnRlZCA9IHN0ci5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvfChbXlxcXFw6XXxeKVxcL1xcLy4qJC9nbSwgJyQxJylcbiAgICByZXR1cm4gdW5jb21tZW50ZWQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlcihzdHIpIHtcblxuICAgIC8vIFRyaW0gY29tbWVudHNcbiAgICB2YXIgc3RyID0gdHJpbUNvbW1lbnRzKHN0cilcblxuICAgIC8vIFNwbGl0IGNvZGUgYXJyYXlcbiAgICB2YXIgY29kZUFyeSA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICB2YXIgY29kZSA9IHt9XG5cbiAgICAvLyBNb3ZlIHRvIG9iamVjdCAgd2l0aCB0cmltbWVkIHZhbHVlc1xuICAgIGNvZGVBcnkuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuICAgICAgICB2YXIgbGluZSA9IGVsZW1lbnQudHJpbSgpXG4gICAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgICAgICBjb2RlW2ldID0gZWxlbWVudC50cmltKClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGZpbmFsID0ge31cbiAgICB2YXIgbGFiZWxzID0ge31cbiAgICB2YXIgaSA9IDA7XG4gICAgXG4gICAgLy8gR2V0IExPT1BTLCBlLmcuIChMT09QKSBhbmQgbGluZSBudW1iZXJcbiAgICB2YXIgcmVnRXhwID0gL1xcKChbXildKylcXCkvXG5cbiAgICBmb3IgKGtleSBpbiBjb2RlKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gcmVnRXhwLmV4ZWMoY29kZVtrZXldKTtcbiAgICAgICAgaWYgKCFtYXRjaGVzKSB7XG4gICAgICAgICAgICBmaW5hbFtpKytdID0gY29kZVtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFiZWxzW21hdGNoZXNbMV1dID0gcGFyc2VJbnQoaSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1vdmUgbGFiZWxzIGFuZCBjb2RlIHRvIHRoaXNcbiAgICB0aGlzLmxhYmVscyA9IGxhYmVsc1xuICAgIHRoaXMuY29kZSA9IGZpbmFsXG4gICBcbiAgICAvLyBTdXN0aXR1dGUgbGFiZWxzIHdpdGggbGluZSBudW1iZXJcbiAgICB0aGlzLnN1YkxhYmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcbiAgICAgICAgICAgIGlmICh0aGlzLmxhYmVscy5oYXNPd25Qcm9wZXJ0eShsaW5lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29kZVtrZXldID0gJ0AnICsgdGhpcy5sYWJlbHNbbGluZV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1lbW9yeSBzdGFydCBhZnRlciBsYXN0IHJlZ2lzdGVyXG4gICAgdGhpcy5jdXJyZW50TSA9IDE2XG5cbiAgICAvLyBBZGQgb3RoZXIgc3ltYm9scyB0byBzeW1ib2wgdGFibGVcbiAgICB0aGlzLmFkZFN5bWJvbHNUb3RhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0T3Bjb2RlKHRoaXMuY29kZVtrZXldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdAJywgJycpXG5cbiAgICAgICAgICAgICAgICBpZiAoIXN5bWJvbFRhYmxlLmhhc093blByb3BlcnR5KGxpbmUpICYmIGlzTmFOKGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbFRhYmxlW2xpbmVdID0gdGhpcy5jdXJyZW50TVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNKytcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdWJzdGl0dXRlIGFsbCBzeW1ib2xzXG4gICAgdGhpcy5zdWJTeW1ib2xzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5jb2RlW2tleV1cbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcbiAgICAgICAgICAgIGlmIChzeW1ib2xUYWJsZS5oYXNPd25Qcm9wZXJ0eShsaW5lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29kZVtrZXldID0gJ0AnICsgc3ltYm9sVGFibGVbbGluZV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldCBvcGNvZGVcbiAgICB0aGlzLmdldE9wY29kZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0AnKSkge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIC8vIFBhcnNlIEMgb3Bjb2RlXG4gICAgLy8gaXh4YWNjY2NjY2RkZGpqalxuICAgIHRoaXMucGFyc2VPcGNvZGVDID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBwYXJ0cyA9IHt9XG5cbiAgICAgICAgLy8gQXNzaWdubWVudFxuICAgICAgICB2YXIgYXJ5ID0gbGluZS5zcGxpdCgnPScpXG4gICAgICAgIGlmIChhcnkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcGFydHNbJ2QnXSA9IGRlc3RbYXJ5WzBdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snYyddID0gY29tcFthcnlbMV1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydqJ10gPSAnMDAwJ1xuICAgICAgICB9IFxuXG4gICAgICAgIHZhciBhcnkgPSBsaW5lLnNwbGl0KCc7JylcbiAgICAgICAgaWYgKGFyeS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBwYXJ0c1snYyddID0gY29tcFthcnlbMF1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydkJ10gPSAnMDAwJyAvL2Rlc3RbYXJ5WzBdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snaiddID0ganVtcFthcnlbMV1dLnRvU3RyaW5nKClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnN0cnVjdGlvbiA9ICcxMTEnICsgcGFydHNbJ2MnXSArIHBhcnRzWydkJ10gKyBwYXJ0c1snaiddXG4gICAgICAgIHJldHVybiBpbnN0cnVjdGlvblxuXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgQSBvcGNvZGVcbiAgICB0aGlzLnBhcnNlT3Bjb2RlQSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcblxuICAgICAgICB2YXIgaSA9IHBhcnNlSW50KGxpbmUpXG4gICAgICAgIHZhciBiaW4gPSBpLnRvU3RyaW5nKDIpXG5cbiAgICAgICAgd2hpbGUoYmluLmxlbmd0aCA8IDE2KSB7XG4gICAgICAgICAgICBiaW4gPSBcIjBcIiArIGJpblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiaW5cbiAgICB9XG5cbiAgICAvLyBBc3NlbWJsZVxuICAgIHRoaXMuZ2V0QXNzZW1ibGVDb2RlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHRoaXMuc3ViTGFiZWwoKVxuICAgICAgICB0aGlzLmFkZFN5bWJvbHNUb3RhYmxlKClcbiAgICAgICAgdGhpcy5zdWJTeW1ib2xzKClcblxuICAgICAgICB2YXIgaW5zdHJ1Y3Rpb25zID0gJydcbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5jb2RlKSB7XG4gICAgICAgICAgICBsZXQgb3Bjb2RlID0gdGhpcy5nZXRPcGNvZGUodGhpcy5jb2RlW2tleV0pXG4gICAgICAgICAgICBpZiAob3Bjb2RlID09IDEpIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbnMgKz10aGlzLnBhcnNlT3Bjb2RlQyh0aGlzLmNvZGVba2V5XSkgKyAnXFxuJ1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbnMgKz0gdGhpcy5wYXJzZU9wY29kZUEodGhpcy5jb2RlW2tleV0pICsgJ1xcbidcbiAgICAgICAgICAgIH0gICAgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RydWN0aW9ucy50cmltKClcbiAgICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy5hc3NlbWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc3RydWN0aW9ucyA9IHRoaXMuZ2V0QXNzZW1ibGVDb2RlKClcbiAgICAgICAgY29uc29sZS5sb2coaW5zdHJ1Y3Rpb25zKVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NlbWJsZXJcbiIsInZhciBIYWNrID0gcmVxdWlyZSgnLi9pbmRleCcpXG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICAvLyBIYWNrIHNwZWNpYWwga2V5cyBjb21wYXJlZCB0byBhc2NpaVxuICAgIHZhciBrZXlzID0ge1xuICAgICAgICAxMzogMTI4LFxuICAgICAgICA4OiAxMjksXG4gICAgICAgIDM3OiAxMzAsXG4gICAgICAgIDM4OiAxMzEsXG4gICAgICAgIDM5OiAxMzIsXG4gICAgICAgIDQwOiAxMzMsXG4gICAgICAgIDM2OiAxMzQsXG4gICAgICAgIDM1OiAxMzUsXG4gICAgICAgIDMzOiAxMzYsXG4gICAgICAgIDI0OiAxMzcsXG4gICAgICAgIDQ1OiAxMzgsXG4gICAgICAgIDQ2OiAxMzksXG4gICAgICAgIDI3OiAxNDAsXG4gICAgICAgIDExMjogMTQxLFxuICAgICAgICAxMTM6IDE0MixcbiAgICAgICAgMTE0OiAxNDMsXG4gICAgICAgIDExNTogMTQ0LFxuICAgICAgICAxMTY6IDE0NSxcbiAgICAgICAgMTE3OiAxNDYsXG4gICAgICAgIDExODogMTQ3LFxuICAgICAgICAxMTk6IDE0OCxcbiAgICAgICAgMTIwOiAxNDksXG4gICAgICAgIDEyMTogMTUwLFxuICAgICAgICAxMjI6IDE1MSxcbiAgICAgICAgMTIzOiAxNTJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5ka2VLZXlEb3duKGUpIHtcbiAgICAgICAgdmFyIGtleUNvZGUgPSBwYXJzZUludChlLmtleUNvZGUpXG4gICAgICAgIGlmIChrZXlDb2RlIGluIGtleXMpIHtcbiAgICAgICAgICAgIGtleUNvZGUgPSBrZXlzW2tleUNvZGVdXG4gICAgICAgIH1cbiAgICAgICAgaGFjay5SQU1bMjQ1NzZdID0ga2V5Q29kZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRrZUtleVVwKCkge1xuICAgICAgICBoYWNrLlJBTVsyNDU3Nl0gPSAwXG4gICAgfVxuXG4gICAgdmFyIGhhY2tcbiAgICB2YXIgaW50ZXJ2YWxJRFxuICAgIHZhciBydW5uaW5nID0gZmFsc2VcbiAgICB2YXIgb3Bjb2RlcyA9IHBhcnNlSW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGNvZGVzJykudmFsdWUpXG4gICAgdmFyIG1pbGxpID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbGxpJykudmFsdWUpXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3Bjb2RlcycpLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgb3Bjb2RlcyA9IHRoaXMudmFsdWVcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbGxpJykuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBtaWxsaSA9IHRoaXMudmFsdWVcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJydW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblxuICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRrZUtleURvd24sIHRydWUpXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGhhbmRrZUtleVVwLCB0cnVlKVxuICAgICAgICAgICAgc3RvcEFuaW1hdGlvbigpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpXG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhc20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNtJykudmFsdWVcbiAgICAgICAgc2V0dXBIYWNrKGFzbSlcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9wXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGtlS2V5RG93biwgdHJ1ZSlcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgaGFuZGtlS2V5VXAsIHRydWUpXG4gICAgICAgICAgICBzdG9wQW5pbWF0aW9uKClcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRClcbiAgICAgICAgICAgIGhhY2sgPSBudWxsXG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBzZXR1cEhhY2soYXNtKSB7XG5cbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaGFjayA9IG5ldyBIYWNrKClcbiAgICAgICAgaGFjay5DQU5WQVMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjcmVlblwiKVxuICAgICAgICBoYWNrLkNBTlZBU19DVFggPSBoYWNrLkNBTlZBUy5nZXRDb250ZXh0KFwiMmRcIilcbiAgICAgICAgaGFjay5DQU5WQVNfREFUQSA9IGhhY2suQ0FOVkFTX0NUWC5nZXRJbWFnZURhdGEoMCwgMCwgaGFjay5DQU5WQVMud2lkdGgsIGhhY2suQ0FOVkFTLmhlaWdodClcbiAgICAgICAgaGFjay5sb2FkUk9NKGFzbSlcbiAgICAgICAgaGFjay5kZWJ1ZyA9IDBcblxuICAgICAgICBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGNvZGVzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBoYWNrLmN5Y2xlKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhhY2suY3ljbGVzRG9uZSAlIDEwMDAwMCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bU9wY29kZXMnKS5pbm5lckhUTUwgPSBoYWNrLmN5Y2xlc0RvbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgbWlsbGkpXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRrZUtleURvd24pXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgaGFuZGtlS2V5VXApXG5cbiAgICAgICAgc3RhcnRBbm1hdGlvbigpXG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlXG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3RJZFxuXG4gICAgZnVuY3Rpb24gbG9vcEFuaW1hdGlvbih0aW1lKSB7XG4gICAgICAgIHJlcXVlc3RJZCA9IHVuZGVmaW5lZFxuICAgICAgICBoYWNrLnVwZGF0ZUNhbnZhcygpXG4gICAgICAgIHN0YXJ0QW5tYXRpb24oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydEFubWF0aW9uKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3RJZCkge1xuICAgICAgICAgICAgcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3BBbmltYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcEFuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcXVlc3RJZCkge1xuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVxdWVzdElkKTtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
