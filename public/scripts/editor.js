$(() => {
    canvas.height = 500
    canvas.width = 500

    const screen = new Screen(0, [-1, -1, -1, -1], false)
    var selected_item = $("#select_obstacle").val()

    $.get("/world_file", ((data) => {
        console.log(data);
        }), "application/json"
    )

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
        screen.removeObstacles()
        ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
        screen.draw()
        drawGrid()
    })

    //clear everything
    $("#clearE").click(() => {
        $("#next1").val(-1)
        $("#next2").val(-1)
        $("#next3").val(-1)
        $("#next4").val(-1)
        $("#number").val(0)
        screen.removeObstacles()
        ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
        screen.draw()
        drawGrid()
    })
})