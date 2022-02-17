$(() => {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    canvas.height = 500
    canvas.width = 500

    const screen = new Screen(0, [-1, -1, -1, -1], true, ctx)
    var selected_item = $("#select_obstacle").val()

    //rita grid
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

    //om klick
    $("#canvas").mouseup((e) => {
        console.log("klick");
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        let i = Math.floor(x / 50)
        let j = Math.floor(y / 50)
        console.log(i + " , " + j)

        if (selected_item !== "first") {
            screen.addObstacle(new Obstacle(50, 50, i * 50, j * 50, ctx, selected_item))
            screen.draw()
        }
    })

    $("#select_obstacle").change(() => {
        selected_item = $("#select_obstacle").val()
    })

    $("#submit").click(() => {
        console.log(JSON.stringify(screen))
        $.post("/update_world", JSON.stringify(screen))
    })
})