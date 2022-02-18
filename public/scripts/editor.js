$(() => {
    canvas.height = 500
    canvas.width = 500

    var screen = new Screen(0, [-1, -1, -1, -1], false)
    var selected_item = $("#select_obstacle").val()
    var screens = []

    $.get("/world_file", (data) => {
        console.log(screen);
        data.forEach(s => {
            screens.push(Screen.from(s))
            $("#edit_screen").append(`<option value="${s.number}">${s.number}</option>`)
        })
    })


    drawGrid()
    function drawGrid() {
        ctx.beginPath()
        for (let i = 50; i < 500; i += 50) {
            ctx.moveTo(i, 0)
            ctx.lineTo(i, canvas.height)
        }
        for (let i = 50; i < 500; i += 50) {
            ctx.moveTo(0, i)
            ctx.lineTo(canvas.width, i)
        }
        ctx.stroke()
    }

    //om klick
    $("#canvas").mousedown((e) => {
        console.log("klick")
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        let i = Math.floor(x / 50)
        let j = Math.floor(y / 50)
        console.log(i + " , " + j)

        if (selected_item !== "first") {
            screen.addObstacle(new Obstacle(50, 50, i * 50, j * 50, selected_item))
            screen.draw()
        }
    })

    $("#select_obstacle").change(() => {
        selected_item = $("#select_obstacle").val()
    })

    $("#edit_screen").change(() => {
        console.log('---------------');
        console.log(screens);
        screen = screens.find(s => {return $("#edit_screen").val() === s.number}) //selected_screen
        console.log('-------------');
        console.log(screen);
        $("#next1").val(screen.nextScreens[0])
        $("#next2").val(screen.nextScreens[1])
        $("#next3").val(screen.nextScreens[2])
        $("#next4").val(screen.nextScreens[3])
        $("#number").val(screen.number)
        clear_canvas()
    })

    $("#submit").click(() => {
        console.log('klick')
        screen.number = $("#number").val()
        screen.nextScreens = [$("#next1").val(), $("#next2").val(), $("#next3").val(), $("#next4").val()]
        console.log(screen);
        $.ajax({
            type: "POST",
            url: "/update_world",
            data: JSON.stringify(screen),
            contentType: 'application/json; charset=utf-8',
            dataType: "json"
        })
    })

    //clear canvas
    $("#clearC").click(() => {
        clear_canvas()
    })

    //clear everything
    $("#clearE").click(() => {
        clear_settings()
        clear_canvas()
    })

    function clear_canvas() {
        screen.removeObstacles()
        ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
        screen.draw()
        drawGrid()
    }

    function clear_settings() {
        $("#next1").val(-1)
        $("#next2").val(-1)
        $("#next3").val(-1)
        $("#next4").val(-1)
        $("#number").val(0)
    }
})