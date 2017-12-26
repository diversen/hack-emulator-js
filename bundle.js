(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var assembler = require('hack-assembler')

function CPU() {

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
    
    function dec2bin(dec) {
        var bin = (dec >>> 0).toString(2)
        var bit32 = getBinVal(bin)
        return bit32.substring(16,32)
    
    }

    // Get X and Y position of the word on the image
    // According to the position in RAM
    // RAM[16384 + r*32 + c%16]
    this.getImageRowColumn = function () {
        var numWord = this.ARegister - this.SCREEN_RAM

        var y = Math.floor(numWord*16/512)
        var x = numWord*16%512

        var xy = {x: x, y: y}

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
                this.drawPixel(x + 16- i, y, 0, 0, 0, 255)
            } else {
                this.drawPixel(x + 16 -i, y, 255, 255, 255, 0)
            }
        })
    }

    this.updateCanvas = function () {
        this.CANVAS_CTX.putImageData(this.CANVAS_DATA, 0, 0);
    }

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

module.exports = CPU

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
var CPU = require('./cpu')

window.onload = () => {

    var run = document.getElementById("run")
    run.addEventListener("click", function () {
        var asm = document.getElementById('asm').value;
        setupHack(asm)
    })

    var cpu

    function setupHack (asm) {
        cpu = new CPU()
        cpu.CANVAS = document.getElementById("screen")
        cpu.CANVAS_CTX = cpu.CANVAS.getContext("2d")
        cpu.CANVAS_DATA = cpu.CANVAS_CTX.getImageData(0, 0, cpu.CANVAS.width, cpu.CANVAS.height)
        cpu.loadROM(asm)
        cpu.debug = 0

        window.addEventListener("keydown", (e) => {
            cpu.RAM[24576] = e.keyCode
        });
        
        window.addEventListener("keyup", (e) => {
            cpu.RAM[24576] = 0
        });

        setInterval(function () {
            for (var i = 0; i < 50000; i++) {
                cpu.cycle()
            }
        }, 100)

        startAnmation()
    }
    
    var requestId
    var fps = 50

    function loopAnimation(time) {
        requestId = undefined
        cpu.updateCanvas()
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

},{"./cpu":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjcHUuanMiLCJub2RlX21vZHVsZXMvaGFjay1hc3NlbWJsZXIvY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL2hhY2stYXNzZW1ibGVyL2luZGV4LmpzIiwidGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFzc2VtYmxlciA9IHJlcXVpcmUoJ2hhY2stYXNzZW1ibGVyJylcblxuZnVuY3Rpb24gQ1BVKCkge1xuXG4gICAgdGhpcy5ST00gPSBuZXcgQXJyYXkoMzI3NjcpIC8vIDB4MDAwMCB0byAweDgwMDBcbiAgICB0aGlzLlJBTSA9IG5ldyBBcnJheSgyNDU3NikgLy8gMHgwMDAwIHRvIDB4NjAwMFxuICAgIHRoaXMuUkFNLmZpbGwoMClcblxuICAgIHRoaXMuS0JEID0gMjQ1NzYgICAgLy8gS2V5Ym9hcmQgcG9zaXRpb24gaW4gMHg2MDAwXG4gICAgdGhpcy5QQyA9IDBcbiAgICB0aGlzLkRSZWdpc3RlciA9IDBcbiAgICB0aGlzLkFSZWdpc3RlciA9IDBcblxuICAgIHRoaXMuY29tcCA9IHtcbiAgICAgICAgLy8gJzAxMDEwMTAnOiAnMCcsXG4gICAgICAgICcwMTAxMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTExMTEnOiAnMScsXG4gICAgICAgICcwMTExMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTEwMTAnOiAnLTEnLFxuICAgICAgICAnMDExMTAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMTEwMCc6ICdEJyxcbiAgICAgICAgJzAwMDExMDAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAxMTAwMDAnOiAnQScsXG4gICAgICAgICcwMTEwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTAxJzogJyFEJyxcbiAgICAgICAgJzAwMDExMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gfnRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDAxJzogJyFBJyxcbiAgICAgICAgJzAxMTAwMDEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gfnRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDAxMTExJzogJy1EJyxcbiAgICAgICAgJzAwMDExMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLXRoaXMuRFJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDExJzogJy1BJyxcbiAgICAgICAgJzAxMTAwMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gLXRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDExMTExJzogJ0QrMScsXG4gICAgICAgICcwMDExMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyICsgMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExMDExMSc6ICdBKzEnLFxuICAgICAgICAnMDExMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFSZWdpc3RlciArIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDExMTAnOiAnRC0xJyxcbiAgICAgICAgJzAwMDExMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5EUmVnaXN0ZXIgLSAxXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTEwMDEwJzogJ0EtMScsXG4gICAgICAgICcwMTEwMDEwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQVJlZ2lzdGVyIC0gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMDAxMCc6ICdEK0EnLFxuICAgICAgICAnMDAwMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciArIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEwMDExJzogJ0QtQScsXG4gICAgICAgICcwMDEwMDExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIC0gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMDAxMTEnOiAnQS1EJyxcbiAgICAgICAgJzAwMDAxMTEnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5BUmVnaXN0ZXIgLSB0aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDAwMDAwMCc6ICdEJkEnLFxuICAgICAgICAnMDAwMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAmIHRoaXMuQVJlZ2lzdGVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEwMTAxJzogJ0R8QScsXG4gICAgICAgICcwMDEwMTAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIHwgdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMDAnOiAnTScsXG4gICAgICAgICcxMTEwMDAwJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExMDAwMSc6ICchTScsXG4gICAgICAgICcxMTEwMDAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIH50aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMTEnOiAnLU0nLFxuICAgICAgICAnMTExMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAtdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEwMTExJzogJ00rMScsXG4gICAgICAgICcxMTEwMTExJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXSArIDFcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMTAwMTAnOiAnTS0xJyxcbiAgICAgICAgJzExMTAwMTAnOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdIC0gMVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDAxMCc6ICdEK00nLFxuICAgICAgICAnMTAwMDAxMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciArIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxMDAxMSc6ICdELU0nLFxuICAgICAgICAnMTAxMDAxMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAtIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDExMSc6ICdNLUQnLFxuICAgICAgICAnMTAwMDExMSc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJBTVt0aGlzLkFSZWdpc3Rlcl0gLSB0aGlzLkRSZWdpc3RlclxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwMDAwMCc6ICdEJk0nLFxuICAgICAgICAnMTAwMDAwMCc6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkRSZWdpc3RlciAmIHRoaXMuUkFNW3RoaXMuQVJlZ2lzdGVyXVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxMDEwMSc6ICdEfE0nXG4gICAgICAgICcxMDEwMTAxJzogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuRFJlZ2lzdGVyIHwgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTY3JlZW5cbiAgICB0aGlzLlNJWkVfQklUUyA9IDUxMiAqIDI1NlxuICAgIHRoaXMuU0laRV9XT1JEUyA9IHRoaXMuU0laRV9CSVRTIC8gMTZcbiAgICB0aGlzLlNDUkVFTl9SQU0gPSAxNjM4NFxuXG4gICAgdGhpcy5DQU5WQVMgPSBudWxsXG4gICAgdGhpcy5DQU5WQVNfQ1RYID0gbnVsbFxuICAgIHRoaXMuQ0FOVkFTX0RBVEEgPSBudWxsXG5cbiAgICBmdW5jdGlvbiBnZXRCaW5WYWwoaSkge1xuICAgICAgICB2YXIgYmluID0gaS50b1N0cmluZygyKVxuICAgICAgICB3aGlsZSAoYmluLmxlbmd0aCA8IDMyKSB7XG4gICAgICAgICAgICBiaW4gPSBcIjBcIiArIGJpblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiaW5cbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gZGVjMmJpbihkZWMpIHtcbiAgICAgICAgdmFyIGJpbiA9IChkZWMgPj4+IDApLnRvU3RyaW5nKDIpXG4gICAgICAgIHZhciBiaXQzMiA9IGdldEJpblZhbChiaW4pXG4gICAgICAgIHJldHVybiBiaXQzMi5zdWJzdHJpbmcoMTYsMzIpXG4gICAgXG4gICAgfVxuXG4gICAgLy8gR2V0IFggYW5kIFkgcG9zaXRpb24gb2YgdGhlIHdvcmQgb24gdGhlIGltYWdlXG4gICAgLy8gQWNjb3JkaW5nIHRvIHRoZSBwb3NpdGlvbiBpbiBSQU1cbiAgICAvLyBSQU1bMTYzODQgKyByKjMyICsgYyUxNl1cbiAgICB0aGlzLmdldEltYWdlUm93Q29sdW1uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbnVtV29yZCA9IHRoaXMuQVJlZ2lzdGVyIC0gdGhpcy5TQ1JFRU5fUkFNXG5cbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKG51bVdvcmQqMTYvNTEyKVxuICAgICAgICB2YXIgeCA9IG51bVdvcmQqMTYlNTEyXG5cbiAgICAgICAgdmFyIHh5ID0ge3g6IHgsIHk6IHl9XG5cbiAgICAgICAgcmV0dXJuIHh5XG4gICAgfVxuXG4gICAgLy8gRHJhdyBwaXhlbCBvbiBjYW52YXNcbiAgICB0aGlzLmRyYXdQaXhlbCA9IGZ1bmN0aW9uICh4LCB5LCByLCBnLCBiLCBhKSB7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gKHggKyB5ICogdGhpcy5DQU5WQVMud2lkdGgpICogNDtcblxuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAwXSA9IHI7XG4gICAgICAgIHRoaXMuQ0FOVkFTX0RBVEEuZGF0YVtpbmRleCArIDFdID0gZztcbiAgICAgICAgdGhpcy5DQU5WQVNfREFUQS5kYXRhW2luZGV4ICsgMl0gPSBiO1xuICAgICAgICB0aGlzLkNBTlZBU19EQVRBLmRhdGFbaW5kZXggKyAzXSA9IGE7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVJbWFnZURhdGEgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBnZXQgYmluIHZhbFxuICAgICAgICB2YXIgcm93Q29sdW1uID0gdGhpcy5nZXRJbWFnZVJvd0NvbHVtbigpXG4gICAgICAgIHZhciB4ID0gcm93Q29sdW1uLnhcbiAgICAgICAgdmFyIHkgPSByb3dDb2x1bW4ueVxuXG4gICAgICAgIHZhciBiaW5WYWwgPSBkZWMyYmluKHZhbClcbiAgICAgICAgdmFyIGJpbkFyeSA9IGJpblZhbC5zcGxpdCgnJylcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyb3dDb2x1bW4pXG4gICAgICAgIGJpbkFyeS5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImRlYzpcIiAsIHZhbCwgXCJiaW46XCIsIGJpblZhbCwgXCJyb3dDb2x1bW5cIiwgcm93Q29sdW1uLCBcIng6XCIsIHgsIFwieTpcIiwgeSlcbiAgICAgICAgICAgIGlmIChlbGVtID09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQaXhlbCh4ICsgMTYtIGksIHksIDAsIDAsIDAsIDI1NSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGl4ZWwoeCArIDE2IC1pLCB5LCAyNTUsIDI1NSwgMjU1LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLkNBTlZBU19DVFgucHV0SW1hZ2VEYXRhKHRoaXMuQ0FOVkFTX0RBVEEsIDAsIDApO1xuICAgIH1cblxuICAgIHRoaXMuc2NyZWVuID0gMVxuXG4gICAgLy8gU2V0IHNjcmVlbiBSQU0gZm9yIGZhc3QgYWNjZXNzXG4gICAgLy8gQXMgc2NyZWVuIGlzIHVwZGF0ZWQgb2Z0ZW5cbiAgICB0aGlzLnNldFJBTSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5SQU1bdGhpcy5BUmVnaXN0ZXJdID0gdmFsXG4gICAgICAgIGlmICh0aGlzLkFSZWdpc3RlciA+PSB0aGlzLlNDUkVFTl9SQU0gJiYgdGhpcy5BUmVnaXN0ZXIgPCB0aGlzLktCRCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NyZWVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbWFnZURhdGEodmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVzdGluYXRpb25cbiAgICB0aGlzLmRlc3QgPSB7XG4gICAgICAgIC8vICcwMDAnOiAnMCcsXG4gICAgICAgICcwMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAvLyBEbyBub3RoaW5nXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMDEnOiAnTScsXG4gICAgICAgICcwMDEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcwMTAnOiAnRCcsXG4gICAgICAgICcwMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkRSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExJzogJ01EJyxcbiAgICAgICAgJzAxMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgICAgICB0aGlzLnNldFJBTSh2YWwpXG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDAnOiAnQScsXG4gICAgICAgICcxMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAxJzogJ0FNJyxcbiAgICAgICAgJzEwMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZXRSQU0odmFsKVxuICAgICAgICAgICAgdGhpcy5BUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzExMCc6ICdBRCcsXG4gICAgICAgICcxMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuRFJlZ2lzdGVyID0gdmFsXG4gICAgICAgICAgICB0aGlzLkFSZWdpc3RlciA9IHZhbFxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTExJzogJ0FNRCdcbiAgICAgICAgJzExMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5EUmVnaXN0ZXIgPSB2YWxcbiAgICAgICAgICAgIHRoaXMuc2V0UkFNKHZhbClcbiAgICAgICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gdmFsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmp1bXAgPSB7XG4gICAgICAgIC8vICcwMDAnOiAnMCcsXG4gICAgICAgICcwMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8gJzAwMSc6ICdKR1QnLFxuICAgICAgICAnMDAxJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDEwJzogJ0pFUScsXG4gICAgICAgICcwMTAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMDExJzogJ0pHRScsXG4gICAgICAgICcwMTEnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAnMTAwJzogJ0pMVCcsXG4gICAgICAgICcxMDAnOiAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMDEnOiAnSk5FJyxcbiAgICAgICAgJzEwMSc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgIT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTAnOiAnSkxFJyxcbiAgICAgICAgJzExMCc6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWwgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vICcxMTEnOiAnSk1QJ1xuICAgICAgICAnMTExJzogKHZhbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluc3RydWN0aW9uOiBpeHhhY2NjY2NjZGRkampqXG4gICAgLy8gR2V0IG9wY29kZVxuICAgIC8vIDAgPSBDIGluc3RydWN0aW9uIFxuICAgIC8vIDEgPSBBIGluc3RydWN0aW9uXG4gICAgdGhpcy5nZXRPcGNvZGUgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHJldHVybiBpbnMuc3Vic3RyaW5nKDAsIDEpXG4gICAgfVxuXG4gICAgdGhpcy5nZXRDb21wID0gZnVuY3Rpb24gKGlucykge1xuICAgICAgICByZXR1cm4gaW5zLnN1YnN0cmluZygzLCAxMClcbiAgICB9XG5cbiAgICB0aGlzLmdldERlc3QgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHJldHVybiBpbnMuc3Vic3RyaW5nKDEwLCAxMylcbiAgICB9XG5cbiAgICB0aGlzLmdldEp1bXAgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHJldHVybiBpbnMuc3Vic3RyaW5nKDEzLCAxNilcbiAgICB9XG5cbiAgICB0aGlzLmRlYnVnQ3ljbGUgPSBmdW5jdGlvbiAoaW5zKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3Bjb2RlID0gdGhpcy5nZXRPcGNvZGUoaW5zKVxuICAgICAgICBjb25zb2xlLmxvZygnT3Bjb2RlICcsIG9wY29kZSlcbiAgICAgICAgaWYgKG9wY29kZSA9PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXQgJywgcGFyc2VJbnQoaW5zLCAyKSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdCAodmFsdWUpICcsIHRoaXMuUkFNW3BhcnNlSW50KGlucywgMildKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0lucyAnLCBpbnMpXG4gICAgICAgIGNvbnNvbGUubG9nKCdQQyAnLCB0aGlzLlBDKVxuICAgICAgICBjb25zb2xlLmxvZygnQWZ0ZXIgUGFyc2UnKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ0FMVU91dCcsIHRoaXMuQUxVT3V0KVxuICAgICAgICBjb25zb2xlLmxvZygnQVJlZyAnLCB0aGlzLkFSZWdpc3RlcilcbiAgICAgICAgY29uc29sZS5sb2coJ0RSZWcgJywgdGhpcy5EUmVnaXN0ZXIpXG5cbiAgICAgICAgY29uc29sZS5sb2codGhpcy5SQU0uc2xpY2UoMCwgMTYpKVxuICAgICAgICBjb25zb2xlLmxvZygnLS0tJylcbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlc0RvbmUgPSAwXG4gICAgdGhpcy5kZWJ1ZyA9IDBcblxuICAgIHRoaXMuY3ljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBDID0gdGhpcy5QQ1xuICAgICAgICBcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLlJPTVt0aGlzLlBDXSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5zID0gdGhpcy5ST01bdGhpcy5QQ11cblxuICAgICAgICB2YXIgb3Bjb2RlID0gdGhpcy5nZXRPcGNvZGUoaW5zKVxuICAgICAgICBpZiAob3Bjb2RlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVDKGlucylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3ljbGVBKGlucylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3ljbGVzRG9uZSsrXG4gICAgICAgIGlmICh0aGlzLmN5Y2xlc0RvbmUgJSAxMDAwMDAgPT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN5Y2xlc0RvbmUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlQyA9IGZ1bmN0aW9uIChpbnMpIHtcblxuICAgICAgICB2YXIgY29tcCA9IHRoaXMuZ2V0Q29tcChpbnMpXG4gICAgICAgIHZhciBkZXN0ID0gdGhpcy5nZXREZXN0KGlucylcbiAgICAgICAgdmFyIGp1bXAgPSB0aGlzLmdldEp1bXAoaW5zKVxuICAgICAgICB2YXIganVtcGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgQUxVT3V0ID0gdGhpcy5jb21wW2NvbXBdKClcbiAgICAgICAgdGhpcy5BTFVPdXQgPSBBTFVPdXRcblxuICAgICAgICBpZiAoZGVzdCAhPSAnMDAwJykge1xuICAgICAgICAgICAgdGhpcy5kZXN0W2Rlc3RdKEFMVU91dClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChqdW1wICE9ICcwMDAnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5qdW1wW2p1bXBdKEFMVU91dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLlBDID0gdGhpcy5BUmVnaXN0ZXJcbiAgICAgICAgICAgICAgICBqdW1wZWQgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWp1bXBlZCkge1xuICAgICAgICAgICAgdGhpcy5QQysrXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRlYnVnQ3ljbGUoaW5zKVxuXG4gICAgfVxuXG4gICAgdGhpcy5jeWNsZUEgPSBmdW5jdGlvbiAoaW5zKSB7XG4gICAgICAgIHRoaXMuQVJlZ2lzdGVyID0gcGFyc2VJbnQoaW5zLCAyKVxuICAgICAgICB0aGlzLlBDKytcbiAgICAgICAgdGhpcy5kZWJ1Z0N5Y2xlKGlucylcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRST00gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBhc3MgPSBuZXcgYXNzZW1ibGVyKHN0cilcbiAgICAgICAgdmFyIGJpbiA9IGFzcy5nZXRBc3NlbWJsZUNvZGUoKVxuXG4gICAgICAgIHZhciBwcm9ncmFtID0gYmluLnNwbGl0KCdcXG4nKVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcHJvZ3JhbS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ST01baV0gPSBwcm9ncmFtW2ldO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENQVVxuIiwidmFyIHN5bWJvbFRhYmxlID0ge1xuICAgICdSMCc6IDAsXG4gICAgJ1IxJzogMSxcbiAgICAnUjInOiAyLFxuICAgICdSMyc6IDMsXG4gICAgJ1I0JzogNCxcbiAgICAnUjUnOiA1LFxuICAgICdSNic6IDYsXG4gICAgJ1I3JzogNyxcbiAgICAnUjgnOiA4LFxuICAgICdSOSc6IDksXG4gICAgJ1IxMCc6IDEwLFxuICAgICdSMTEnOiAxMSxcbiAgICAnUjEyJzogMTIsXG4gICAgJ1IxMyc6IDEzLFxuICAgICdSMTQnOiAxNCxcbiAgICAnUjE1JzogMTUsXG4gICAgJ1NDUkVFTic6IDE2Mzg0LFxuICAgICdLQkQnOiAyNDU3NixcbiAgICAnU1AnOiAwLFxuICAgICdMQ0wnOiAxLFxuICAgICdBUkcnOiAyLFxuICAgICdUSElTJzogMyxcbiAgICAnVEhBVCc6IDRcbn1cblxubW9kdWxlLmV4cG9ydHMuc3ltYm9sVGFibGUgPSBzeW1ib2xUYWJsZVxuXG52YXIgZGVzdCA9IHtcbiAgICAnMCc6ICAgICcwMDAnLFxuICAgICdNJzogICAgJzAwMScsXG4gICAgJ0QnOiAgICAnMDEwJyxcbiAgICAnTUQnOiAgICcwMTEnLFxuICAgICdBJzogICAgJzEwMCcsXG4gICAgJ0FNJzogICAnMTAxJyxcbiAgICAnQUQnOiAgICcxMTAnLFxuICAgICdBTUQnOiAgJzExMSdcbn1cblxubW9kdWxlLmV4cG9ydHMuZGVzdCA9IGRlc3RcblxudmFyIGp1bXAgPSB7XG4gICAgJzAnOiAgICAnMDAwJyxcbiAgICAnSkdUJzogICcwMDEnLFxuICAgICdKRVEnOiAgJzAxMCcsXG4gICAgJ0pHRSc6ICAnMDExJyxcbiAgICAnSkxUJzogICcxMDAnLFxuICAgICdKTkUnOiAgJzEwMScsXG4gICAgJ0pMRSc6ICAnMTEwJyxcbiAgICAnSk1QJzogICcxMTEnXG59XG5cbm1vZHVsZS5leHBvcnRzLmp1bXAgPSBqdW1wXG5cbnZhciBjb21wID0ge1xuICAgICcwJzogICAgJzAxMDEwMTAnLFxuICAgICcxJzogICAgJzAxMTExMTEnLFxuICAgICctMSc6ICAgJzAxMTEwMTAnLFxuICAgICdEJzogICAgJzAwMDExMDAnLFxuICAgICdBJzogICAgJzAxMTAwMDAnLFxuICAgICchRCc6ICAgJzAwMDExMDEnLFxuICAgICchQSc6ICAgJzAxMTAwMDEnLFxuICAgICctRCc6ICAgJzAwMDExMTEnLFxuICAgICctQSc6ICAgJzAxMTAwMTEnLFxuICAgICdEKzEnOiAgJzAwMTExMTEnLFxuICAgICdBKzEnOiAgJzAxMTAxMTEnLFxuICAgICdELTEnOiAgJzAwMDExMTAnLFxuICAgICdBLTEnOiAgJzAxMTAwMTAnLFxuICAgICdEK0EnOiAgJzAwMDAwMTAnLFxuICAgICdELUEnOiAgJzAwMTAwMTEnLFxuICAgICdBLUQnOiAgJzAwMDAxMTEnLFxuICAgICdEJkEnOiAgJzAwMDAwMDAnLFxuICAgICdEfEEnOiAgJzAwMTAxMDEnLFxuICAgICdNJzogICAgJzExMTAwMDAnLFxuICAgICchTSc6ICAgJzExMTAwMDEnLFxuICAgICctTSc6ICAgJzExMTAwMTEnLFxuICAgICdNKzEnOiAgJzExMTAxMTEnLFxuICAgICdNLTEnOiAgJzExMTAwMTAnLFxuICAgICdEK00nOiAgJzEwMDAwMTAnLFxuICAgICdELU0nOiAgJzEwMTAwMTEnLFxuICAgICdNLUQnOiAgJzEwMDAxMTEnLFxuICAgICdEJk0nOiAgJzEwMDAwMDAnLFxuICAgICdEfE0nOiAgJzEwMTAxMDEnXG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbXAgPSBjb21wIiwidmFyIHtzeW1ib2xUYWJsZSwgZGVzdCwganVtcCwgY29tcH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIHRyaW1Db21tZW50cyhzdHIpIHtcbiAgICB2YXIgdW5jb21tZW50ZWQgPSBzdHIucmVwbGFjZSgvXFwvXFwqW1xcc1xcU10qP1xcKlxcL3woW15cXFxcOl18XilcXC9cXC8uKiQvZ20sICckMScpXG4gICAgcmV0dXJuIHVuY29tbWVudGVkLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiBhc3NlbWJsZXIoc3RyKSB7XG5cbiAgICAvLyBUcmltIGNvbW1lbnRzXG4gICAgdmFyIHN0ciA9IHRyaW1Db21tZW50cyhzdHIpXG5cbiAgICAvLyBTcGxpdCBjb2RlIGFycmF5XG4gICAgdmFyIGNvZGVBcnkgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgdmFyIGNvZGUgPSB7fVxuXG4gICAgLy8gTW92ZSB0byBvYmplY3QgIHdpdGggdHJpbW1lZCB2YWx1ZXNcbiAgICBjb2RlQXJ5LmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcbiAgICAgICAgdmFyIGxpbmUgPSBlbGVtZW50LnRyaW0oKVxuICAgICAgICBpZiAobGluZSkge1xuICAgICAgICAgICAgY29kZVtpXSA9IGVsZW1lbnQudHJpbSgpXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBmaW5hbCA9IHt9XG4gICAgdmFyIGxhYmVscyA9IHt9XG4gICAgdmFyIGkgPSAwO1xuICAgIFxuICAgIC8vIEdldCBMT09QUywgZS5nLiAoTE9PUCkgYW5kIGxpbmUgbnVtYmVyXG4gICAgdmFyIHJlZ0V4cCA9IC9cXCgoW14pXSspXFwpL1xuXG4gICAgZm9yIChrZXkgaW4gY29kZSkge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHJlZ0V4cC5leGVjKGNvZGVba2V5XSk7XG4gICAgICAgIGlmICghbWF0Y2hlcykge1xuICAgICAgICAgICAgZmluYWxbaSsrXSA9IGNvZGVba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhYmVsc1ttYXRjaGVzWzFdXSA9IHBhcnNlSW50KGkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNb3ZlIGxhYmVscyBhbmQgY29kZSB0byB0aGlzXG4gICAgdGhpcy5sYWJlbHMgPSBsYWJlbHNcbiAgICB0aGlzLmNvZGUgPSBmaW5hbFxuICAgXG4gICAgLy8gU3VzdGl0dXRlIGxhYmVscyB3aXRoIGxpbmUgbnVtYmVyXG4gICAgdGhpcy5zdWJMYWJlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5jb2RlKSB7XG4gICAgICAgICAgICBsZXQgbGluZSA9IHRoaXMuY29kZVtrZXldXG4gICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdAJywgJycpXG4gICAgICAgICAgICBpZiAodGhpcy5sYWJlbHMuaGFzT3duUHJvcGVydHkobGluZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGVba2V5XSA9ICdAJyArIHRoaXMubGFiZWxzW2xpbmVdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZW1vcnkgc3RhcnQgYWZ0ZXIgbGFzdCByZWdpc3RlclxuICAgIHRoaXMuY3VycmVudE0gPSAxNlxuXG4gICAgLy8gQWRkIG90aGVyIHN5bWJvbHMgdG8gc3ltYm9sIHRhYmxlXG4gICAgdGhpcy5hZGRTeW1ib2xzVG90YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5jb2RlKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmdldE9wY29kZSh0aGlzLmNvZGVba2V5XSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgbGluZSA9IHRoaXMuY29kZVtrZXldXG4gICAgICAgICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgnQCcsICcnKVxuXG4gICAgICAgICAgICAgICAgaWYgKCFzeW1ib2xUYWJsZS5oYXNPd25Qcm9wZXJ0eShsaW5lKSAmJiBpc05hTihsaW5lKSkge1xuICAgICAgICAgICAgICAgICAgICBzeW1ib2xUYWJsZVtsaW5lXSA9IHRoaXMuY3VycmVudE1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TSsrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3Vic3RpdHV0ZSBhbGwgc3ltYm9sc1xuICAgIHRoaXMuc3ViU3ltYm9scyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5jb2RlKSB7XG4gICAgICAgICAgICBsZXQgbGluZSA9IHRoaXMuY29kZVtrZXldXG4gICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdAJywgJycpXG4gICAgICAgICAgICBpZiAoc3ltYm9sVGFibGUuaGFzT3duUHJvcGVydHkobGluZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGVba2V5XSA9ICdAJyArIHN5bWJvbFRhYmxlW2xpbmVdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgb3Bjb2RlXG4gICAgdGhpcy5nZXRPcGNvZGUgPSBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKCdAJykpIHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICAvLyBQYXJzZSBDIG9wY29kZVxuICAgIC8vIGl4eGFjY2NjY2NkZGRqampcbiAgICB0aGlzLnBhcnNlT3Bjb2RlQyA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgcGFydHMgPSB7fVxuXG4gICAgICAgIC8vIEFzc2lnbm1lbnRcbiAgICAgICAgdmFyIGFyeSA9IGxpbmUuc3BsaXQoJz0nKVxuICAgICAgICBpZiAoYXJ5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHBhcnRzWydkJ10gPSBkZXN0W2FyeVswXV0udG9TdHJpbmcoKVxuICAgICAgICAgICAgcGFydHNbJ2MnXSA9IGNvbXBbYXJ5WzFdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snaiddID0gJzAwMCdcbiAgICAgICAgfSBcblxuICAgICAgICB2YXIgYXJ5ID0gbGluZS5zcGxpdCgnOycpXG4gICAgICAgIGlmIChhcnkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcGFydHNbJ2MnXSA9IGNvbXBbYXJ5WzBdXS50b1N0cmluZygpXG4gICAgICAgICAgICBwYXJ0c1snZCddID0gJzAwMCcgLy9kZXN0W2FyeVswXV0udG9TdHJpbmcoKVxuICAgICAgICAgICAgcGFydHNbJ2onXSA9IGp1bXBbYXJ5WzFdXS50b1N0cmluZygpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSAnMTExJyArIHBhcnRzWydjJ10gKyBwYXJ0c1snZCddICsgcGFydHNbJ2onXVxuICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb25cblxuICAgIH1cblxuICAgIC8vIFBhcnNlIEEgb3Bjb2RlXG4gICAgdGhpcy5wYXJzZU9wY29kZUEgPSBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdAJywgJycpXG5cbiAgICAgICAgdmFyIGkgPSBwYXJzZUludChsaW5lKVxuICAgICAgICB2YXIgYmluID0gaS50b1N0cmluZygyKVxuXG4gICAgICAgIHdoaWxlKGJpbi5sZW5ndGggPCAxNikge1xuICAgICAgICAgICAgYmluID0gXCIwXCIgKyBiaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmluXG4gICAgfVxuXG4gICAgLy8gQXNzZW1ibGVcbiAgICB0aGlzLmdldEFzc2VtYmxlQ29kZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB0aGlzLnN1YkxhYmVsKClcbiAgICAgICAgdGhpcy5hZGRTeW1ib2xzVG90YWJsZSgpXG4gICAgICAgIHRoaXMuc3ViU3ltYm9scygpXG5cbiAgICAgICAgdmFyIGluc3RydWN0aW9ucyA9ICcnXG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMuY29kZSkge1xuICAgICAgICAgICAgbGV0IG9wY29kZSA9IHRoaXMuZ2V0T3Bjb2RlKHRoaXMuY29kZVtrZXldKVxuICAgICAgICAgICAgaWYgKG9wY29kZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zICs9dGhpcy5wYXJzZU9wY29kZUModGhpcy5jb2RlW2tleV0pICsgJ1xcbidcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zICs9IHRoaXMucGFyc2VPcGNvZGVBKHRoaXMuY29kZVtrZXldKSArICdcXG4nXG4gICAgICAgICAgICB9ICAgIFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0cnVjdGlvbnMudHJpbSgpXG4gICAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuYXNzZW1ibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnN0cnVjdGlvbnMgPSB0aGlzLmdldEFzc2VtYmxlQ29kZSgpXG4gICAgICAgIGNvbnNvbGUubG9nKGluc3RydWN0aW9ucylcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzZW1ibGVyXG4iLCJ2YXIgQ1BVID0gcmVxdWlyZSgnLi9jcHUnKVxuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuXG4gICAgdmFyIHJ1biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicnVuXCIpXG4gICAgcnVuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhc20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNtJykudmFsdWU7XG4gICAgICAgIHNldHVwSGFjayhhc20pXG4gICAgfSlcblxuICAgIHZhciBjcHVcblxuICAgIGZ1bmN0aW9uIHNldHVwSGFjayAoYXNtKSB7XG4gICAgICAgIGNwdSA9IG5ldyBDUFUoKVxuICAgICAgICBjcHUuQ0FOVkFTID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY3JlZW5cIilcbiAgICAgICAgY3B1LkNBTlZBU19DVFggPSBjcHUuQ0FOVkFTLmdldENvbnRleHQoXCIyZFwiKVxuICAgICAgICBjcHUuQ0FOVkFTX0RBVEEgPSBjcHUuQ0FOVkFTX0NUWC5nZXRJbWFnZURhdGEoMCwgMCwgY3B1LkNBTlZBUy53aWR0aCwgY3B1LkNBTlZBUy5oZWlnaHQpXG4gICAgICAgIGNwdS5sb2FkUk9NKGFzbSlcbiAgICAgICAgY3B1LmRlYnVnID0gMFxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgICAgICAgICAgY3B1LlJBTVsyNDU3Nl0gPSBlLmtleUNvZGVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBjcHUuUkFNWzI0NTc2XSA9IDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MDAwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3B1LmN5Y2xlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKVxuXG4gICAgICAgIHN0YXJ0QW5tYXRpb24oKVxuICAgIH1cbiAgICBcbiAgICB2YXIgcmVxdWVzdElkXG4gICAgdmFyIGZwcyA9IDUwXG5cbiAgICBmdW5jdGlvbiBsb29wQW5pbWF0aW9uKHRpbWUpIHtcbiAgICAgICAgcmVxdWVzdElkID0gdW5kZWZpbmVkXG4gICAgICAgIGNwdS51cGRhdGVDYW52YXMoKVxuICAgICAgICBzdGFydEFubWF0aW9uKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRBbm1hdGlvbigpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3BBbmltYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcEFuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcXVlc3RJZCkge1xuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVxdWVzdElkKTtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
