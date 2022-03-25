$(() => {
    canvas.height = 500
    canvas.width = 500

    var screen = new Screen(0, [-1, -1, -1, -1], false)
    var selected_obstacle = $("#select_obstacle").val()
    var selected_item = $("#select_item").val()
    var screens = []

    get_world_file()

    function get_world_file() {
        $.get("/world_file", (data) => {
            //console.log('@@@@@@@@@@@@@@@@@@@');
            //console.log(data)
            screens = []
            $("#edit_screen").empty()
            $("#edit_screen").append('<option value="first" selected>Choose screen to edit</option>')
            data.forEach(s => {
                console.log(s);
                screens.push(Screen.from(s))
                $("#edit_screen").append(`<option value="${s.number}">${s.number}</option>`)
            })
            //console.log(screens)
        })
    }


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
        //console.log(i + " , " + j)

        if ($("#erase").is(":checked")) {
            screen.obstacles.forEach((o, a) => {
                if (o.x === i * 50 && o.y === j * 50) {
                    console.log(a)
                    screen.obstacles.splice(a, 1)
                    redraw_canvas()
                }
            })
            console.log(screen.items);
            screen.items.forEach((o, a) => {
                if (o.x === i * 50 + 15 && o.y === j * 50 + 15) {
                    screen.items.splice(a, 1)
                    redraw_canvas()
                }
            })
        }
        else if (selected_obstacle !== "choose") {
            screen.addObstacle(new Obstacle(50, 50, i * 50, j * 50, selected_obstacle))
            redraw_canvas()
        } else if (selected_item !== "choose") {
            screen.addItem(new Item(20, 20, i * 50 + 15, j * 50 + 15, selected_item))
            redraw_canvas()
        }
    })

    $("#erase").click(() => {
        console.log($("#erase").is(":checked"))

        $("#select_item").val("choose")
        selected_item = "choose"
        $("#select_obstacle").val("choose")
        selected_obstacle = "choose"
    })

    $("#select_obstacle").change(() => {
        selected_obstacle = $("#select_obstacle").val()
        if ($("#select_obstacle").val() !== "choose") {
            $("#select_item").val("choose");
            selected_item = "choose"
            $("#erase").prop('checked', false)
        }
        console.log('item= ' + $("#select_item").val() + ". obstacle= " + $("#select_obstacle").val());
    })

    $("#select_item").change(() => {
        selected_item = $("#select_item").val()
        if ($("#select_item").val() !== "choose") {
            $("#select_obstacle").val("choose");
            selected_obstacle = "choose"
            $("#erase").prop('checked', false)
        }
        console.log('item= ' + $("#select_item").val() + ". obstacle= " + $("#select_obstacle").val());
    })

    $("#edit_screen").change(() => {
        /* console.log('---------------')
        console.log(screens[0].obstacles) */
        if ($("#edit_screen").val() !== 'first') {
            let nscreen = screens.find(s => { return parseInt($("#edit_screen").val()) === s.number }) //selected_screen
            //console.log(JSON.stringify(nscreen));
            screen = Screen.from(structuredClone(nscreen))
            $("#next1").val(screen.nextScreens[0])
            $("#next2").val(screen.nextScreens[1])
            $("#next3").val(screen.nextScreens[2])
            $("#next4").val(screen.nextScreens[3])
            $("#number").val(screen.number)
            redraw_canvas()
        } else {
            screen.removeObstacles()
            screen.removeItems()
            clear_settings()
            redraw_canvas()
        }
    })

    $("#submit").click(() => {
        console.log('submit')
        screen.number = parseInt($("#number").val())
        screen.nextScreens = [parseInt($("#next1").val()), parseInt($("#next2").val()), parseInt($("#next3").val()), parseInt($("#next4").val())]
        screen.addBorders()
        console.log(screen)
        let found = false
        for (let i = 0; i < screens.length; i++) {
            if (screens[i].number === screen.number) {
                screens[i] = screen
                found = true
                console.log(screens[i]);
            }
        }
        if (!found) {
            screens.push(screen)
        }
        console.log(screens);
        $.ajax({
            type: "POST",
            url: "/update_world",
            data: JSON.stringify(screens),
            contentType: 'application/json; charset=utf-8',
            dataType: "json"
        })
        screen.removeObstacles()
        screen.removeItems()
        clear_settings()
        redraw_canvas()
        get_world_file()
    })

    //clear canvas
    $("#clearC").click(() => {
        screen.removeObstacles()
        screen.removeItems()
        redraw_canvas()
    })

    //clear everything
    $("#clearE").click(() => {
        screen.removeObstacles()
        screen.removeItems()
        clear_settings()
        redraw_canvas()
    })

    function redraw_canvas() {
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