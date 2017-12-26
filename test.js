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
