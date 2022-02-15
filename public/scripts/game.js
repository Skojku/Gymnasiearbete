function game() {

    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext("2d")
    var speed = 200
    canvas.height = 500
    canvas.width = 500

    var player

    var screens = []
    screens[0] = new Screen(0, [1, -1, -1, -1], false, ctx)
    screens[0].obstacles.push(new Obstacle(50, 50, 300, 300, ctx, "tree"))
    screens[0].obstacles.push(new Obstacle(50, 50, 195, 300, ctx, "bush"))
    screens[1] = new Screen(1, [-1, -1, 0, -1], false, ctx)
    screens[1].obstacles.push(new Obstacle(50, 50, 100, 100, ctx, "stone"))
    var screen

    var keys = {
        up: false,
        down: false,
        right: false,
        left: false
    }

    socket.on('player', (user, characters2) => { //kolla på det här sen
        screens.forEach((s1) => {
            if (s1.number === user.screen) {
                s1.active = true
                screen = s1
                //console.log("screen: " + screen.number);
            }
        })
        //console.log(characters2);
        characters2.forEach(c => {
            if (user.username === c.username) {
                player = new Character(50, 50, user.pos[0], user.pos[1], ctx, 'green', user.username)
            } else {
                let newCharacter = new Character(50, 50, c.pos[0], c.pos[1], ctx, 'blue', c.username)
                newCharacter.draw()
                screens[c.screen].characters.push(newCharacter)
            }
        })
    })

    socket.on('new_character', (user) => {
        //screens.find((s1) => { return s1.number === s }).characters.push(new Character(50, 50, pos[0], pos[1], ctx, 'green', username))
        screens[user.screen].characters.push(new Character(50, 50, user.pos[0], user.pos[1], ctx, 'blue', user.username))
    })

    socket.on('remove_character', (username) => {
        screen.characters.splice(screen.characters.indexOf(screen.characters.find((c) => { return c.username === username })), 1)
    })

    socket.on('position', (user) => { //ändra andras position
        //console.log(screens[user.screen]);
        screens[user.screen].characters.forEach(c => {
            if (user.username === c.username) {
                c.updatePosition(user.pos)
            }
        })
    })

    socket.on('change_screen', (s, newS, u) => {
        let user;
        screens.forEach(s1 => {
            if (s1.number === s) {
                user = s1.characters.splice(s1.characters.indexOf(s1.characters.find((u1) => { return u1.username === u })), 1)[0]
                //console.log("-----------------");
                //console.log(user);
                //console.log(s1.characters);
            } 
        })
        screens.forEach(s1 => {
            if (s1.number === newS) {
                //console.log('u: ' + u);
                //console.log(user.username + " -----------");
                s1.characters.push(user)
            }
        })
    })

    let previous_timestamp
    function game_loop(timestamp) {
        window.requestAnimationFrame(game_loop)
        if (!previous_timestamp) {
            previous_timestamp = timestamp
        }
        const dt = (timestamp - previous_timestamp) / 1000
        previous_timestamp = timestamp

        if (keys.right) { player.moveX(-speed * dt) }
        if (keys.left) { player.moveX(speed * dt) }
        if (keys.up) { player.moveY(-speed * dt) }
        if (keys.down) { player.moveY(speed * dt) }
        //console.log(keys)

        //console.log(getActiveScreen())

        ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
        if (player) { //om player är loadad
            if ((keys.right || keys.left || keys.up || keys.down) && !isCollide(player, screen.obstacles)) {
                //console.log(!isCollide(player, screen.obstacles))
                player.updateOwnPosition()
                socket.emit('position', [player.x, player.y])
            } else {
                player.resetNewPos()
            }
            checkIfNewScreen()
            $("#screen_nr").html("Screen: " + screen.number);
            //console.log(player.x);
            player.draw()
            screen.draw()
        }
    }

    window.requestAnimationFrame(game_loop)

    function isCollide(player, obstacles) {
        let isColliding = false
        obstacles.forEach(o => {
            if (!(((player.newY + player.height) < (o.y)) ||
                (player.newY > (o.y + o.height)) ||
                ((player.newX + player.width) < o.x) ||
                (player.newX > (o.x + o.width)))) {
                isColliding = true
            }
        })
        return isColliding
    }

    function checkIfNewScreen() {
        screen.nextScreens.forEach((n, i) => {
            if (n != -1) {
                let change = false
                switch (i) {
                    case 0:
                        if (player.x < 0) { //vänster
                            player.x = canvas.width - player.width
                            change = true
                        }
                        break
                    case 1:
                        if (player.y < 0) { //upp
                            player.y = canvas.height - player.height
                            change = true
                        }
                        break
                    case 2:
                        if (player.x + player.width > canvas.width) { //höger
                            player.x = 0
                            change = true
                        }
                        break
                    case 3:
                        if (player.y + player.height > canvas.height) { //ner
                            player.y = 0
                            change = true
                        }
                        break
                    default:
                        change = false
                        break
                }
                if (change) {
                    player.resetNewPos()
                    screen.active = false
                    console.log('n: ' + n);
                    let newScreen = screens.find((s) => { return s.number === n })
                    socket.emit("change_screen", screen.number, newScreen.number)
                    screens[screens.indexOf(newScreen)].active = true
                    screen = getActiveScreen()
                }
            }
        })
    }

    function getActiveScreen() {
        return screens.find((screen) => { return screen.active === true })
    }

    $(window).keydown((e) => {
        let key = e.which
        switch (key) {
            case 65: //a
                keys.right = true
                break
            case 68: //d
                keys.left = true
                break
            case 83: //s
                keys.down = true
                break
            case 87: //w
                keys.up = true
                break
            case 32: //space
                console.log("space")
                break
            default:
                break
        }
    })

    $(window).keyup((e) => {
        let key = e.which
        switch (key) {
            case 65: //a
                keys.right = false
                break
            case 68: //d
                keys.left = false
                break
            case 83: //s
                keys.down = false
                break
            case 87: //w
                keys.up = false
                break
            default:
                break
        }
    })
}