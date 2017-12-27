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
