function page() {
    var active_users = []
    
    // uppdatera usern i databasen samt logga ut
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

    // uppdaterar usern
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

    // printar alla users som är online till skärmen
    socket.on("active_users", (users) => {
        // console.log('active users')
        active_users = users
        // console.log(active_users);
        printUsers()
    })

    // vid en restart av servern, logga ut usern
    socket.on('server_restart', () => {
        socket.disconnect()
        $.post("/logout")
        window.location.replace('/')
    })

    // printar prinar alla aktiva users i ett html-element
    function printUsers() {
        $("#users").empty()
        // console.log(active_users)
        active_users.forEach(user => {
            $("#users").append(`<li>${user}</li>`)
        })
    }
}
