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
