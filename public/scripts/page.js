function page() {
    var active_users = []

    $("#logout").click(() => { 
        console.log('klick')
        $.post("/logout", () => {
            socket.disconnect()
            window.location.reload()
        })
    })

    socket.io.on('disconnected', () => {
        console.log('test');
        socket.emit('test')
    })

    socket.on('connect', () => {
        console.log("connected")
    })

    socket.io.on("ping", () => { 
        console.log("ping");
        socket.emit('pong')
    })

    socket.on("active_users", (users) => {
        //console.log('active users')
        active_users = users
        printUsers()
    })

    socket.on("user_connected", (user) => {
        console.log("user_connected")
        active_users.push(user)
        printUsers()
    })

    socket.on('server_restart', () => {
        socket.disconnect()
        $.post("/logout")
        window.location.replace('/')
    }) 

    function printUsers() {
        $("#users").empty()
        //console.log(username)
        active_users.forEach(user => {
            if (user === username) {
                $("#users").append(`<li>${user} (you)</li>`)
            } else {
                $("#users").append(`<li>${user}</li>`)
            }
        })
    }
}