function page() {
    var active_users = []

    $("#logout").click(() => {
        console.log(player);
        let data = {
            screen: screen.number,
            x: player.x,
            y: player.y,
            inventory: player.inventory
        }
        console.log(JSON.stringify(data));
        $.ajax({
            type: "PUT",
            url: "/update_user",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: () => {
                console.log('success');
                $.post("/logout", () => {
                    console.log('logout');
                    socket.disconnect()
                    window.location.reload()
                })
            }
        })
    })

    socket.on('update_user', () => {
        let data = {
            screen: screen.number,
            x: player.x,
            y: player.y,
            inventory: player.inventory
        }
        $.ajax({
            type: "PUT",
            url: "/update_user",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: function () {
                console.log('Saved player')
            }
        })
    })

    socket.on('connect', () => {
        console.log("connected")
    })

    socket.io.on("ping", () => { //varje 25 sekunder skickar servern en "ping" för att se om klienten fortfarande är kvar, annars stängs anslutningen
        console.log("ping")
        socket.emit('pong')
    })

    socket.on("active_users", (users) => {
        //console.log('active users')
        active_users = users
        console.log(active_users);
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
        // console.log(username)
        active_users.forEach(user => {
            $("#users").append(`<li>${user}</li>`)
        })
    }
}