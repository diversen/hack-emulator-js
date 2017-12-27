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

    // Used for screen
    // Screen operates bits
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

        // console.log(rowColumn)
        binAry.forEach((elem, i) => {
            // console.log("dec:" , val, "bin:", binVal, "rowColumn", rowColumn, "x:", x, "y:", y)
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

    function handkeKeyDown (e) {
        hack.RAM[24576] = parseInt(e.keyCode)
    }
    
    function handkeKeyUp () {
        hack.RAM[24576] = 0
    }

    var hack
    var intervalID
    var running = false
    var opcodes = parseInt(document.getElementById('opcodes').value)
    var milli = parseInt(document.getElementById('milli').value)

    document.getElementById('opcodes').addEventListener('input', function(e) {
        opcodes = this.value
    })

    document.getElementById('milli').addEventListener('input', function(e) {
        milli = this.value
    })

    document.getElementById("run").addEventListener("click", ()  => {
        
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

    document.getElementById("stop").addEventListener("click", ()  => {
        if (running) {
            window.removeEventListener("keydown", handkeKeyDown, true)
            window.removeEventListener("keyup", handkeKeyUp, true)
            stopAnimation()
            clearInterval(intervalID)
            hack = null
            running = false
        }
    })

    function setupHack (asm) {
        
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYWNrLWFzc2VtYmxlci9jb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvaGFjay1hc3NlbWJsZXIvaW5kZXguanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEFzIHRoZSBoYWNrIGNvbXB1dGVyIGlzIHF1aXRlIHNtYWxsXG4gKiBFdmVyeXRoaW5nIGlzIHBsYWNlZCBpbiB0aGlzIGZpbGVcbiAqIENQVSwgUkFNLCBST00sIFNjcmVlbiwgS2V5Ym9hcmRcbiAqL1xuXG52YXIgYXNzZW1ibGVyID0gcmVxdWlyZSgnaGFjay1hc3NlbWJsZXInKVxuXG5mdW5jdGlvbiBIYWNrKCkge1xuXG4gICAgdGhpcy5ST00gPSBuZXcgQXJyYXkoMzI3NjcpIC8vIDB4MDAwMCB0byAweDgwMDBcbiAgICB0aGlzLlJBTSA9IG5ldyBBcnJheSgyNDU3NikgLy8gMHgwMDAwIHRvIDB4NjAwMFxuICAgIHRoaXMuUkFNLmZpbGwoMClcblxuICAgIHRoaXMuS0JEID0gMjQ1NzYgICAgLy8gS2V5Ym9hcmQgcG9zaXRpb24gaW4gMHg2MDAwXG4gICAgdGhpcy5QQyA9IDBcbiAgICB0aGlzLkRSZWdpc3RlciA9IDBcbiAgICB0aGlzLkFSZWdpc3RlciA9IDBcblxuICAgIHRoaXMuY29tcCA9IHtcbiAgICAgICAgLy8gJzAxMDEwMTAnOiAnMCcsXG4gICAgICAgICcwMTAxMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTExMTEnOiAnMScsXG4gICAgICAgICcwMTExMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTEwMTAnOiAnLTEnLFxuICAgICAgICAnMDExMTAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMTEwMCc6ICdEJyxcbiAgICAgICAgJzAwMDExMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAwMDAnOiAnQScsXG4gICAgICAgICcwMTEwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTAxJzogJyFEJyxcbiAgICAgICAgJzAwMDExMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gfnRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDAxJzogJyFBJyxcbiAgICAgICAgJzAxMTAwMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gfnRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTExJzogJy1EJyxcbiAgICAgICAgJzAwMDExMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLXRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDExJzogJy1BJyxcbiAgICAgICAgJzAxMTAwMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLXRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDExMTExJzogJ0QrMScsXG4gICAgICAgICcwMDExMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICsgMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDExMSc6ICdBKzEnLFxuICAgICAgICAnMDExMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFSZWdpc3RlciArIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDExMTAnOiAnRC0xJyxcbiAgICAgICAgJzAwMDExMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgLSAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDEwJzogJ0EtMScsXG4gICAgICAgICcwMTEwMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyIC0gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMDAxMCc6ICdEK0EnLFxuICAgICAgICAnMDAwMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciArIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEwMDExJzogJ0QtQScsXG4gICAgICAgICcwMDEwMDExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIC0gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDAxMTEnOiAnQS1EJyxcbiAgICAgICAgJzAwMDAxMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5BUmVnaXN0ZXIgLSB0aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMDAwMCc6ICdEJkEnLFxuICAgICAgICAnMDAwMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAmIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEwMTAxJzogJ0R8QScsXG4gICAgICAgICcwMDEwMTAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIHwgdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMDAnOiAnTScsXG4gICAgICAgICcxMTEwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDAwMSc6ICchTScsXG4gICAgICAgICcxMTEwMDAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIH50aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMTEnOiAnLU0nLFxuICAgICAgICAnMTExMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMTExJzogJ00rMScsXG4gICAgICAgICcxMTEwMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXSArIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMTAnOiAnTS0xJyxcbiAgICAgICAgJzExMTAwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdIC0gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDAxMCc6ICdEK00nLFxuICAgICAgICAnMTAwMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciArIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxMDAxMSc6ICdELU0nLFxuICAgICAgICAnMTAxMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAtIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDExMSc6ICdNLUQnLFxuICAgICAgICAnMTAwMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gLSB0aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDAwMCc6ICdEJk0nLFxuICAgICAgICAnMTAwMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAmIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxMDEwMSc6ICdEfE0nXG4gICAgICAgICcxMDEwMTAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIHwgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZXN0aW5hdGlvblxuICAgIHRoaXMuZGVzdCA9IHtcbiAgICAgICAgLy8gJzAwMCc6ICcwJyxcbiAgICAgICAgJzAwMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMSc6ICdNJyxcbiAgICAgICAgJzAwMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0UkFNKHZhbClcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMCc6ICdEJyxcbiAgICAgICAgJzAxMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEnOiAnTUQnLFxuICAgICAgICAnMDExJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5EUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgICAgIHRoaXMuc2V0UkFNKHZhbClcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMCc6ICdBJyxcbiAgICAgICAgJzEwMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDEnOiAnQU0nLFxuICAgICAgICAnMTAxJzogKHZhbCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTEwJzogJ0FEJyxcbiAgICAgICAgJzExMCc6ICh2YWwpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5EUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEnOiAnQU1EJ1xuICAgICAgICAnMTExJzogKHZhbCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLkRSZWdpc3RlciA9IHZhbFxuICAgICAgICAgICAgdGhpcy5zZXRSQU0odmFsKVxuICAgICAgICAgICAgdGhpcy5BUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanVtcCA9IHtcbiAgICAgICAgLy8gJzAwMCc6ICcwJyxcbiAgICAgICAgJzAwMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAxJzogJ0pHVCcsXG4gICAgICAgICcwMDEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTAnOiAnSkVRJyxcbiAgICAgICAgJzAxMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEnOiAnSkdFJyxcbiAgICAgICAgJzAxMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPj0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAnOiAnSkxUJyxcbiAgICAgICAgJzEwMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzEwMSc6ICdKTkUnLFxuICAgICAgICAnMTAxJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCAhPSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMCc6ICdKTEUnLFxuICAgICAgICAnMTEwJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMSc6ICdKTVAnXG4gICAgICAgICcxMTEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyBTY3JlZW5cbiAgICB0aGlzLlNJWkVfQklUUyA9IDUxMiAqIDI1NlxuICAgIHRoaXMuU0laRV9XT1JEUyA9IHRoaXMuU0laRV9CSVRTIC8gMTZcbiAgICB0aGlzLlNDUkVFTl9SQU0gPSAxNjM4NFxuXG4gICAgdGhpcy5DQU5WQVMgPSBudWxsXG4gICAgdGhpcy5DQU5WQVNfQ1RYID0gbnVsbFxuICAgIHRoaXMuQ0FOVkFTX0RBVEEgPSBudWxsXG5cbiAgICBmdW5jdGlvbiBnZXRCaW5WYWwoaSkge1xuICAgICAgICB2YXIgYmluID0gaS50b1N0cmluZygyKVxuICAgICAgICB3aGlsZSAoYmluLmxlbmd0aCA8IDMyKSB7XG4gICAgICAgICAgICBiaW4gPSBcIjBcIiArIGJpblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiaW5cbiAgICB9XG5cbiAgICAvLyBVc2VkIGZvciBzY3JlZW5cbiAgICAvLyBTY3JlZW4gb3BlcmF0ZXMgYml0c1xuICAgIC8vIDEgaXMgb24gMCBpcyBvZmZcbiAgICBmdW5jdGlvbiBkZWMyYmluKGRlYykge1xuICAgICAgICB2YXIgYmluID0gKGRlYyA+Pj4gMCkudG9TdHJpbmcoMilcbiAgICAgICAgdmFyIGJpdDMyID0gZ2V0QmluVmFsKGJpbilcbiAgICAgICAgcmV0dXJuIGJpdDMyLnN1YnN0cmluZygxNiwgMzIpXG5cbiAgICB9XG5cbiAgICAvLyBHZXQgWCBhbmQgWSBwb3NpdGlvbiBvZiB0aGUgd29yZCBvbiB0aGUgaW1hZ2VcbiAgICAvLyBBY2NvcmRpbmcgdG8gdGhlIHBvc2l0aW9uIGluIFJBTVxuICAgIC8vIFJBTVsxNjM4NCArIHIqMzIgKyBjJTE2XVxuICAgIHRoaXMuZ2V0SW1hZ2VSb3dDb2x1bW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBudW1Xb3JkID0gdGhpcy5BUmVnaXN0ZXIgLSB0aGlzLlNDUkVFTl9SQU1cblxuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IobnVtV29yZCAqIDE2IC8gNTEyKVxuICAgICAgICB2YXIgeCA9IG51bVdvcmQgKiAxNiAlIDUxMlxuXG4gICAgICAgIHZhciB4eSA9IHsgeDogeCwgeTogeSB9XG5cbiAgICAgICAgcmV0dXJuIHh5XG4gICAgfVxuXG4gICAgLy8gRHJhdyBwaXhlbCBvbiBjYW52YXNcbiAgICB0aGlzLmRyYXdQaXhlbCA9IGZ1bmN0aW9uICh4LCB5LCByLCBnLCBiLCBhKSB7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gKHggKyB5ICogdGhpcy5DQU5WQVMud2lkdGgpICogNDtcblxuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAwXSA9IHI7XG4gICAgICAgIHRoaXMuQ0FOVkFTX0RBVEEuZGF0YVtpbmRleCArIDFdID0gZztcbiAgICAgICAgdGhpcy5DQU5WQVNfREFUQS5kYXRhW2luZGV4ICsgMl0gPSBiO1xuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAzXSA9IGE7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVJbWFnZURhdGEgPSBmdW5jdGlvbiAodmFsKSB7XG5cbiAgICAgICAgLy8gZ2V0IGJpbiB2YWxcbiAgICAgICAgdmFyIHJvd0NvbHVtbiA9IHRoaXMuZ2V0SW1hZ2VSb3dDb2x1bW4oKVxuICAgICAgICB2YXIgeCA9IHJvd0NvbHVtbi54XG4gICAgICAgIHZhciB5ID0gcm93Q29sdW1uLnlcblxuICAgICAgICB2YXIgYmluVmFsID0gZGVjMmJpbih2YWwpXG4gICAgICAgIHZhciBiaW5BcnkgPSBiaW5WYWwuc3BsaXQoJycpXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2cocm93Q29sdW1uKVxuICAgICAgICBiaW5BcnkuZm9yRWFjaCgoZWxlbSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJkZWM6XCIgLCB2YWwsIFwiYmluOlwiLCBiaW5WYWwsIFwicm93Q29sdW1uXCIsIHJvd0NvbHVtbiwgXCJ4OlwiLCB4LCBcInk6XCIsIHkpXG4gICAgICAgICAgICBpZiAoZWxlbSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGl4ZWwoeCArIDE2IC0gaSwgeSwgMCwgMCwgMCwgMjU1KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQaXhlbCh4ICsgMTYgLSBpLCB5LCAyNTUsIDI1NSwgMjU1LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLkNBTlZBU19DVFgucHV0SW1hZ2VEYXRhKHRoaXMuQ0FOVkFTX0RBVEEsIDAsIDApO1xuICAgIH1cblxuICAgIC8vIEp1c3QgaW4gb3JkZXIgdG8gdHVybiBvZmYgc2NyZWVuXG4gICAgdGhpcy5zY3JlZW4gPSAxXG5cbiAgICAvLyBTZXQgc2NyZWVuIFJBTSBmb3IgZmFzdCBhY2Nlc3NcbiAgICAvLyBBcyBzY3JlZW4gaXMgdXBkYXRlZCBvZnRlblxuICAgIHRoaXMuc2V0UkFNID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gPSB2YWxcbiAgICAgICAgaWYgKHRoaXMuQVJlZ2lzdGVyID49IHRoaXMuU0NSRUVOX1JBTSAmJiB0aGlzLkFSZWdpc3RlciA8IHRoaXMuS0JEKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zY3JlZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUltYWdlRGF0YSh2YWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbnN0cnVjdGlvbjogaXh4YWNjY2NjY2RkZGpqalxuICAgIC8vIEdldCBvcGNvZGVcbiAgICAvLyAwID0gQyBpbnN0cnVjdGlvbiBcbiAgICAvLyAxID0gQSBpbnN0cnVjdGlvblxuICAgIHRoaXMuZ2V0T3Bjb2RlID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygwLCAxKVxuICAgIH1cblxuICAgIHRoaXMuZ2V0Q29tcCA9IGZ1bmN0aW9uIChpbnMpIHtcbiAgICAgICAgcmV0dXJuIGlucy5zdWJzdHJpbmcoMywgMTApXG4gICAgfVxuXG4gICAgdGhpcy5nZXREZXN0ID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygxMCwgMTMpXG4gICAgfVxuXG4gICAgdGhpcy5nZXRKdW1wID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygxMywgMTYpXG4gICAgfVxuXG4gICAgdGhpcy5kZWJ1Z0N5Y2xlID0gZnVuY3Rpb24gKGlucykge1xuXG4gICAgICAgIGlmICghdGhpcy5kZWJ1Zykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wY29kZSA9IHRoaXMuZ2V0T3Bjb2RlKGlucylcbiAgICAgICAgY29uc29sZS5sb2coJ09wY29kZSAnLCBvcGNvZGUpXG4gICAgICAgIGlmIChvcGNvZGUgPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0ICcsIHBhcnNlSW50KGlucywgMikpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXQgKHZhbHVlKSAnLCB0aGlzLlJBTVtwYXJzZUludChpbnMsIDIpXSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnMgJywgaW5zKVxuICAgICAgICBjb25zb2xlLmxvZygnUEMgJywgdGhpcy5QQylcbiAgICAgICAgY29uc29sZS5sb2coJ0FmdGVyIFBhcnNlJylcblxuICAgICAgICBjb25zb2xlLmxvZygnQUxVT3V0JywgdGhpcy5BTFVPdXQpXG4gICAgICAgIGNvbnNvbGUubG9nKCdBUmVnICcsIHRoaXMuQVJlZ2lzdGVyKVxuICAgICAgICBjb25zb2xlLmxvZygnRFJlZyAnLCB0aGlzLkRSZWdpc3RlcilcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLlJBTS5zbGljZSgwLCAxNikpXG4gICAgICAgIGNvbnNvbGUubG9nKCctLS0nKVxuICAgIH1cblxuICAgIHRoaXMuY3ljbGVzRG9uZSA9IDBcbiAgICB0aGlzLmRlYnVnID0gMFxuXG4gICAgdGhpcy5jeWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UEMgPSB0aGlzLlBDXG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLlJPTVt0aGlzLlBDXSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5zID0gdGhpcy5ST01bdGhpcy5QQ11cblxuICAgICAgICB2YXIgb3Bjb2RlID0gdGhpcy5nZXRPcGNvZGUoaW5zKVxuICAgICAgICBpZiAob3Bjb2RlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVDKGlucylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVBKGlucylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3ljbGVzRG9uZSsrXG4gICAgICAgIGlmICh0aGlzLmN5Y2xlc0RvbmUgJSAxMDAwMDAgPT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN5Y2xlc0RvbmUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlQyA9IGZ1bmN0aW9uIChpbnMpIHtcblxuICAgICAgICB2YXIgY29tcCA9IHRoaXMuZ2V0Q29tcChpbnMpXG4gICAgICAgIHZhciBkZXN0ID0gdGhpcy5nZXREZXN0KGlucylcbiAgICAgICAgdmFyIGp1bXAgPSB0aGlzLmdldEp1bXAoaW5zKVxuICAgICAgICB2YXIganVtcGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgQUxVT3V0ID0gdGhpcy5jb21wW2NvbXBdKClcbiAgICAgICAgdGhpcy5BTFVPdXQgPSBBTFVPdXRcblxuICAgICAgICBpZiAoZGVzdCAhPSAnMDAwJykge1xuICAgICAgICAgICAgdGhpcy5kZXN0W2Rlc3RdKEFMVU91dClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChqdW1wICE9ICcwMDAnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5qdW1wW2p1bXBdKEFMVU91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLlBDID0gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgICAgICAgICBqdW1wZWQgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWp1bXBlZCkge1xuICAgICAgICAgICAgdGhpcy5QQysrXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRlYnVnQ3ljbGUoaW5zKVxuXG4gICAgfVxuXG4gICAgdGhpcy5jeWNsZUEgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gcGFyc2VJbnQoaW5zLCAyKVxuICAgICAgICB0aGlzLlBDKytcbiAgICAgICAgdGhpcy5kZWJ1Z0N5Y2xlKGlucylcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRST00gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBhc3MgPSBuZXcgYXNzZW1ibGVyKHN0cilcbiAgICAgICAgdmFyIGJpbiA9IGFzcy5nZXRBc3NlbWJsZUNvZGUoKVxuXG4gICAgICAgIHZhciBwcm9ncmFtID0gYmluLnNwbGl0KCdcXG4nKVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcHJvZ3JhbS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ST01baV0gPSBwcm9ncmFtW2ldO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhY2tcbiIsInZhciBzeW1ib2xUYWJsZSA9IHtcbiAgICAnUjAnOiAwLFxuICAgICdSMSc6IDEsXG4gICAgJ1IyJzogMixcbiAgICAnUjMnOiAzLFxuICAgICdSNCc6IDQsXG4gICAgJ1I1JzogNSxcbiAgICAnUjYnOiA2LFxuICAgICdSNyc6IDcsXG4gICAgJ1I4JzogOCxcbiAgICAnUjknOiA5LFxuICAgICdSMTAnOiAxMCxcbiAgICAnUjExJzogMTEsXG4gICAgJ1IxMic6IDEyLFxuICAgICdSMTMnOiAxMyxcbiAgICAnUjE0JzogMTQsXG4gICAgJ1IxNSc6IDE1LFxuICAgICdTQ1JFRU4nOiAxNjM4NCxcbiAgICAnS0JEJzogMjQ1NzYsXG4gICAgJ1NQJzogMCxcbiAgICAnTENMJzogMSxcbiAgICAnQVJHJzogMixcbiAgICAnVEhJUyc6IDMsXG4gICAgJ1RIQVQnOiA0XG59XG5cbm1vZHVsZS5leHBvcnRzLnN5bWJvbFRhYmxlID0gc3ltYm9sVGFibGVcblxudmFyIGRlc3QgPSB7XG4gICAgJzAnOiAgICAnMDAwJyxcbiAgICAnTSc6ICAgICcwMDEnLFxuICAgICdEJzogICAgJzAxMCcsXG4gICAgJ01EJzogICAnMDExJyxcbiAgICAnQSc6ICAgICcxMDAnLFxuICAgICdBTSc6ICAgJzEwMScsXG4gICAgJ0FEJzogICAnMTEwJyxcbiAgICAnQU1EJzogICcxMTEnXG59XG5cbm1vZHVsZS5leHBvcnRzLmRlc3QgPSBkZXN0XG5cbnZhciBqdW1wID0ge1xuICAgICcwJzogICAgJzAwMCcsXG4gICAgJ0pHVCc6ICAnMDAxJyxcbiAgICAnSkVRJzogICcwMTAnLFxuICAgICdKR0UnOiAgJzAxMScsXG4gICAgJ0pMVCc6ICAnMTAwJyxcbiAgICAnSk5FJzogICcxMDEnLFxuICAgICdKTEUnOiAgJzExMCcsXG4gICAgJ0pNUCc6ICAnMTExJ1xufVxuXG5tb2R1bGUuZXhwb3J0cy5qdW1wID0ganVtcFxuXG52YXIgY29tcCA9IHtcbiAgICAnMCc6ICAgICcwMTAxMDEwJyxcbiAgICAnMSc6ICAgICcwMTExMTExJyxcbiAgICAnLTEnOiAgICcwMTExMDEwJyxcbiAgICAnRCc6ICAgICcwMDAxMTAwJyxcbiAgICAnQSc6ICAgICcwMTEwMDAwJyxcbiAgICAnIUQnOiAgICcwMDAxMTAxJyxcbiAgICAnIUEnOiAgICcwMTEwMDAxJyxcbiAgICAnLUQnOiAgICcwMDAxMTExJyxcbiAgICAnLUEnOiAgICcwMTEwMDExJyxcbiAgICAnRCsxJzogICcwMDExMTExJyxcbiAgICAnQSsxJzogICcwMTEwMTExJyxcbiAgICAnRC0xJzogICcwMDAxMTEwJyxcbiAgICAnQS0xJzogICcwMTEwMDEwJyxcbiAgICAnRCtBJzogICcwMDAwMDEwJyxcbiAgICAnRC1BJzogICcwMDEwMDExJyxcbiAgICAnQS1EJzogICcwMDAwMTExJyxcbiAgICAnRCZBJzogICcwMDAwMDAwJyxcbiAgICAnRHxBJzogICcwMDEwMTAxJyxcbiAgICAnTSc6ICAgICcxMTEwMDAwJyxcbiAgICAnIU0nOiAgICcxMTEwMDAxJyxcbiAgICAnLU0nOiAgICcxMTEwMDExJyxcbiAgICAnTSsxJzogICcxMTEwMTExJyxcbiAgICAnTS0xJzogICcxMTEwMDEwJyxcbiAgICAnRCtNJzogICcxMDAwMDEwJyxcbiAgICAnRC1NJzogICcxMDEwMDExJyxcbiAgICAnTS1EJzogICcxMDAwMTExJyxcbiAgICAnRCZNJzogICcxMDAwMDAwJyxcbiAgICAnRHxNJzogICcxMDEwMTAxJ1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21wID0gY29tcCIsInZhciB7c3ltYm9sVGFibGUsIGRlc3QsIGp1bXAsIGNvbXB9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5mdW5jdGlvbiB0cmltQ29tbWVudHMoc3RyKSB7XG4gICAgdmFyIHVuY29tbWVudGVkID0gc3RyLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC98KFteXFxcXDpdfF4pXFwvXFwvLiokL2dtLCAnJDEnKVxuICAgIHJldHVybiB1bmNvbW1lbnRlZC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVyKHN0cikge1xuXG4gICAgLy8gVHJpbSBjb21tZW50c1xuICAgIHZhciBzdHIgPSB0cmltQ29tbWVudHMoc3RyKVxuXG4gICAgLy8gU3BsaXQgY29kZSBhcnJheVxuICAgIHZhciBjb2RlQXJ5ID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgIHZhciBjb2RlID0ge31cblxuICAgIC8vIE1vdmUgdG8gb2JqZWN0ICB3aXRoIHRyaW1tZWQgdmFsdWVzXG4gICAgY29kZUFyeS5mb3JFYWNoKChlbGVtZW50LCBpKSA9PiB7XG4gICAgICAgIHZhciBsaW5lID0gZWxlbWVudC50cmltKClcbiAgICAgICAgaWYgKGxpbmUpIHtcbiAgICAgICAgICAgIGNvZGVbaV0gPSBlbGVtZW50LnRyaW0oKVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgZmluYWwgPSB7fVxuICAgIHZhciBsYWJlbHMgPSB7fVxuICAgIHZhciBpID0gMDtcbiAgICBcbiAgICAvLyBHZXQgTE9PUFMsIGUuZy4gKExPT1ApIGFuZCBsaW5lIG51bWJlclxuICAgIHZhciByZWdFeHAgPSAvXFwoKFteKV0rKVxcKS9cblxuICAgIGZvciAoa2V5IGluIGNvZGUpIHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSByZWdFeHAuZXhlYyhjb2RlW2tleV0pO1xuICAgICAgICBpZiAoIW1hdGNoZXMpIHtcbiAgICAgICAgICAgIGZpbmFsW2krK10gPSBjb2RlW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYWJlbHNbbWF0Y2hlc1sxXV0gPSBwYXJzZUludChpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTW92ZSBsYWJlbHMgYW5kIGNvZGUgdG8gdGhpc1xuICAgIHRoaXMubGFiZWxzID0gbGFiZWxzXG4gICAgdGhpcy5jb2RlID0gZmluYWxcbiAgIFxuICAgIC8vIFN1c3RpdHV0ZSBsYWJlbHMgd2l0aCBsaW5lIG51bWJlclxuICAgIHRoaXMuc3ViTGFiZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMuY29kZSkge1xuICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmNvZGVba2V5XVxuICAgICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgnQCcsICcnKVxuICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzLmhhc093blByb3BlcnR5KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlW2tleV0gPSAnQCcgKyB0aGlzLmxhYmVsc1tsaW5lXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWVtb3J5IHN0YXJ0IGFmdGVyIGxhc3QgcmVnaXN0ZXJcbiAgICB0aGlzLmN1cnJlbnRNID0gMTZcblxuICAgIC8vIEFkZCBvdGhlciBzeW1ib2xzIHRvIHN5bWJvbCB0YWJsZVxuICAgIHRoaXMuYWRkU3ltYm9sc1RvdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMuY29kZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRPcGNvZGUodGhpcy5jb2RlW2tleV0pID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmNvZGVba2V5XVxuICAgICAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoJ0AnLCAnJylcblxuICAgICAgICAgICAgICAgIGlmICghc3ltYm9sVGFibGUuaGFzT3duUHJvcGVydHkobGluZSkgJiYgaXNOYU4obGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sVGFibGVbbGluZV0gPSB0aGlzLmN1cnJlbnRNXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE0rK1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN1YnN0aXR1dGUgYWxsIHN5bWJvbHNcbiAgICB0aGlzLnN1YlN5bWJvbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMuY29kZSkge1xuICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmNvZGVba2V5XVxuICAgICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgnQCcsICcnKVxuICAgICAgICAgICAgaWYgKHN5bWJvbFRhYmxlLmhhc093blByb3BlcnR5KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlW2tleV0gPSAnQCcgKyBzeW1ib2xUYWJsZVtsaW5lXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0IG9wY29kZVxuICAgIHRoaXMuZ2V0T3Bjb2RlID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgQyBvcGNvZGVcbiAgICAvLyBpeHhhY2NjY2NjZGRkampqXG4gICAgdGhpcy5wYXJzZU9wY29kZUMgPSBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHBhcnRzID0ge31cblxuICAgICAgICAvLyBBc3NpZ25tZW50XG4gICAgICAgIHZhciBhcnkgPSBsaW5lLnNwbGl0KCc9JylcbiAgICAgICAgaWYgKGFyeS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBwYXJ0c1snZCddID0gZGVzdFthcnlbMF1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydjJ10gPSBjb21wW2FyeVsxXV0udG9TdHJpbmcoKVxuICAgICAgICAgICAgcGFydHNbJ2onXSA9ICcwMDAnXG4gICAgICAgIH0gXG5cbiAgICAgICAgdmFyIGFyeSA9IGxpbmUuc3BsaXQoJzsnKVxuICAgICAgICBpZiAoYXJ5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHBhcnRzWydjJ10gPSBjb21wW2FyeVswXV0udG9TdHJpbmcoKVxuICAgICAgICAgICAgcGFydHNbJ2QnXSA9ICcwMDAnIC8vZGVzdFthcnlbMF1dLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhcnRzWydqJ10gPSBqdW1wW2FyeVsxXV0udG9TdHJpbmcoKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluc3RydWN0aW9uID0gJzExMScgKyBwYXJ0c1snYyddICsgcGFydHNbJ2QnXSArIHBhcnRzWydqJ11cbiAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uXG5cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBBIG9wY29kZVxuICAgIHRoaXMucGFyc2VPcGNvZGVBID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgnQCcsICcnKVxuXG4gICAgICAgIHZhciBpID0gcGFyc2VJbnQobGluZSlcbiAgICAgICAgdmFyIGJpbiA9IGkudG9TdHJpbmcoMilcblxuICAgICAgICB3aGlsZShiaW4ubGVuZ3RoIDwgMTYpIHtcbiAgICAgICAgICAgIGJpbiA9IFwiMFwiICsgYmluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJpblxuICAgIH1cblxuICAgIC8vIEFzc2VtYmxlXG4gICAgdGhpcy5nZXRBc3NlbWJsZUNvZGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdGhpcy5zdWJMYWJlbCgpXG4gICAgICAgIHRoaXMuYWRkU3ltYm9sc1RvdGFibGUoKVxuICAgICAgICB0aGlzLnN1YlN5bWJvbHMoKVxuXG4gICAgICAgIHZhciBpbnN0cnVjdGlvbnMgPSAnJ1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLmNvZGUpIHtcbiAgICAgICAgICAgIGxldCBvcGNvZGUgPSB0aGlzLmdldE9wY29kZSh0aGlzLmNvZGVba2V5XSlcbiAgICAgICAgICAgIGlmIChvcGNvZGUgPT0gMSkge1xuICAgICAgICAgICAgICAgIGluc3RydWN0aW9ucyArPXRoaXMucGFyc2VPcGNvZGVDKHRoaXMuY29kZVtrZXldKSArICdcXG4nXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluc3RydWN0aW9ucyArPSB0aGlzLnBhcnNlT3Bjb2RlQSh0aGlzLmNvZGVba2V5XSkgKyAnXFxuJ1xuICAgICAgICAgICAgfSAgICBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zLnRyaW0oKVxuICAgICAgICBcbiAgICB9XG5cbiAgICB0aGlzLmFzc2VtYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5zdHJ1Y3Rpb25zID0gdGhpcy5nZXRBc3NlbWJsZUNvZGUoKVxuICAgICAgICBjb25zb2xlLmxvZyhpbnN0cnVjdGlvbnMpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2VtYmxlclxuIiwidmFyIEhhY2sgPSByZXF1aXJlKCcuL2luZGV4Jylcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcblxuICAgIGZ1bmN0aW9uIGhhbmRrZUtleURvd24gKGUpIHtcbiAgICAgICAgaGFjay5SQU1bMjQ1NzZdID0gcGFyc2VJbnQoZS5rZXlDb2RlKVxuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBoYW5ka2VLZXlVcCAoKSB7XG4gICAgICAgIGhhY2suUkFNWzI0NTc2XSA9IDBcbiAgICB9XG5cbiAgICB2YXIgaGFja1xuICAgIHZhciBpbnRlcnZhbElEXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZVxuICAgIHZhciBvcGNvZGVzID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wY29kZXMnKS52YWx1ZSlcbiAgICB2YXIgbWlsbGkgPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlsbGknKS52YWx1ZSlcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGNvZGVzJykuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIG9wY29kZXMgPSB0aGlzLnZhbHVlXG4gICAgfSlcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaWxsaScpLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICBtaWxsaSA9IHRoaXMudmFsdWVcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJydW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpICA9PiB7XG4gICAgICAgIFxuICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRrZUtleURvd24sIHRydWUpXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGhhbmRrZUtleVVwLCB0cnVlKVxuICAgICAgICAgICAgc3RvcEFuaW1hdGlvbigpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpXG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhc20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNtJykudmFsdWVcbiAgICAgICAgc2V0dXBIYWNrKGFzbSlcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9wXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSAgPT4ge1xuICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRrZUtleURvd24sIHRydWUpXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGhhbmRrZUtleVVwLCB0cnVlKVxuICAgICAgICAgICAgc3RvcEFuaW1hdGlvbigpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpXG4gICAgICAgICAgICBoYWNrID0gbnVsbFxuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgZnVuY3Rpb24gc2V0dXBIYWNrIChhc20pIHtcbiAgICAgICAgXG4gICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGhhY2sgPSBuZXcgSGFjaygpXG4gICAgICAgIGhhY2suQ0FOVkFTID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY3JlZW5cIilcbiAgICAgICAgaGFjay5DQU5WQVNfQ1RYID0gaGFjay5DQU5WQVMuZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgICAgIGhhY2suQ0FOVkFTX0RBVEEgPSBoYWNrLkNBTlZBU19DVFguZ2V0SW1hZ2VEYXRhKDAsIDAsIGhhY2suQ0FOVkFTLndpZHRoLCBoYWNrLkNBTlZBUy5oZWlnaHQpXG4gICAgICAgIGhhY2subG9hZFJPTShhc20pXG4gICAgICAgIGhhY2suZGVidWcgPSAwXG5cbiAgICAgICAgaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3Bjb2RlczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGFjay5jeWNsZSgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYWNrLmN5Y2xlc0RvbmUgJSAxMDAwMDAgPT0gMCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdudW1PcGNvZGVzJykuaW5uZXJIVE1MID0gaGFjay5jeWNsZXNEb25lXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIG1pbGxpKVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5ka2VLZXlEb3duKVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGhhbmRrZUtleVVwKVxuXG4gICAgICAgIHN0YXJ0QW5tYXRpb24oKVxuICAgICAgICBydW5uaW5nID0gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICB2YXIgcmVxdWVzdElkXG5cbiAgICBmdW5jdGlvbiBsb29wQW5pbWF0aW9uKHRpbWUpIHtcbiAgICAgICAgcmVxdWVzdElkID0gdW5kZWZpbmVkXG4gICAgICAgIGhhY2sudXBkYXRlQ2FudmFzKClcbiAgICAgICAgc3RhcnRBbm1hdGlvbigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0QW5tYXRpb24oKSB7XG4gICAgICAgIGlmICghcmVxdWVzdElkKSB7XG4gICAgICAgICAgIHJlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wQW5pbWF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3BBbmltYXRpb24oKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICByZXF1ZXN0SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
