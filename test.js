var CPU = require('./cpu')

window.onload = () => {

    function handkeKeyDown (e) {
        cpu.RAM[24576] = parseInt(e.keyCode)
    }
    
    function handkeKeyUp () {
        cpu.RAM[24576] = 0
    }

    var cpu
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
        
        console.log(opcodes, milli)
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
            cpu = null
            running = false
        }
    })

    function setupHack (asm) {
        
        if (running) {
            return
        }

        cpu = new CPU()
        cpu.CANVAS = document.getElementById("screen")
        cpu.CANVAS_CTX = cpu.CANVAS.getContext("2d")
        cpu.CANVAS_DATA = cpu.CANVAS_CTX.getImageData(0, 0, cpu.CANVAS.width, cpu.CANVAS.height)
        cpu.loadROM(asm)
        cpu.debug = 0

        intervalID = setInterval(function () {
            for (var i = 0; i < opcodes; i++) {
                cpu.cycle()
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
