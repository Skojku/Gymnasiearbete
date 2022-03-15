function game() {
    var speed = 200
    canvas.height = 500
    canvas.width = 500

    var player

    var screens = []
    var screen

    var keys = {
        up: false,
        down: false,
        right: false,
        left: false,
        item: false,
    }

    var dirs = {
        a: false,
        d: false,
        w: false,
        s: true
    }

    $.get("/world_file", (data) => {
        data.forEach(s => {
            screens.push(Screen.from(s))
        })
        //console.log('---------------------');
        //console.log(screens)
    })

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
                player = new Character(50, 50, user.pos[0], user.pos[1], 'green', user.username)
            } else {
                let newCharacter = new Character(50, 50, c.pos[0], c.pos[1], 'blue', c.username)
                newCharacter.draw()
                screens[c.screen].characters.push(newCharacter)
            }
        })
    })

    socket.on('new_character', (user) => {
        //screens.find((s1) => { return s1.number === s }).characters.push(new Character(50, 50, pos[0], pos[1], 'green', username))
        screens[user.screen].characters.push(new Character(50, 50, user.pos[0], user.pos[1], 'blue', user.username))
    })

    socket.on('remove_character', (user) => {
        screens[user.screen].characters.splice(screens[user.screen].characters.indexOf(screens[user.screen].characters.find((c) => { return c.username === user.username })), 1)
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

    socket.on('item taken', (screen_nr, item_index) => {
        console.log('item taken');
        screens.forEach(s => {
            if (s.number === screen_nr) {
                s.items.splice(item_index, 1)
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
        ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
        if (player) { //om player är loadad
            let dx = 0
            let dy = 0
            let moving = false
            if (keys.right) {
                dx = speed * dt
                moving = true
            }
            if (keys.left) {
                dx = -speed * dt
                moving = true
            }
            if (keys.up) {
                dy = -speed * dt
                moving = true
            }
            if (keys.down) {
                dy = speed * dt
                moving = true
            }
            if (keys.item) {
                let i = isCollideItems(player, screen.items)
                if (i !== -1 && !player.inventoryFull(screen.items[i])) {
                    player.addItem(screen.items[i])
                    updateInventoryHTML()
                    screen.items.splice(i, 1)
                    socket.emit('item taken', screen.number, i)
                }
                player.printInventory()
            }
            if (moving) {
                if (isCollide(player, screen.obstacles, dx, dy) !== -1) {
                    if (dx > 0 && isCollide(player, screen.obstacles, dx, 0) !== -1) {
                        moveToObstacle(screen.obstacles[isCollide(player, screen.obstacles, dx, 0)], 'right')
                    } else if (dx < 0 && isCollide(player, screen.obstacles, dx, 0) !== -1) {
                        moveToObstacle(screen.obstacles[isCollide(player, screen.obstacles, dx, 0)], 'left')
                    }
                    if (dy > 0 && isCollide(player, screen.obstacles, 0, dy) !== -1) {
                        moveToObstacle(screen.obstacles[isCollide(player, screen.obstacles, 0, dy)], 'down')
                    } else if (dy < 0 && isCollide(player, screen.obstacles, 0, dy) !== -1) {
                        moveToObstacle(screen.obstacles[isCollide(player, screen.obstacles, 0, dy)], 'up')
                    }
                }
                else {
                    player.move(dx, dy)
                }
                socket.emit('position', [player.x, player.y])
            }
            checkIfNewScreen()
            $("#screen_nr").html("Screen: " + screen.number);
            $("#player_x").html("Player_x: " + player.x);
            $("#player_y").html("Player_y: " + player.y);
            $("#obstacle_x").html("obstacle[0]_x: " + screen.obstacles[0].x);
            $("#obstacle_y").html("obstacle[0]_y: " + screen.obstacles[0].y);
            //console.log(player.x);
            screen.draw()
            player.draw()

        }
    }

    window.requestAnimationFrame(game_loop)

    function isCollide(player, obstacles, dx, dy) {
        let newX = player.x + dx
        let newY = player.y + dy
        isColliding = -1
        obstacles.forEach((o, i) => {
            if (!(((newY + player.hitbox.height) <= (o.y)) ||
                (newY >= (o.y + o.height)) ||
                ((newX + player.hitbox.width) <= o.x) ||
                (newX >= (o.x + o.width)))) { //om alla false
                isColliding = i
            }
        })
        return isColliding
    }

    function moveToObstacle(obstacle, dir) {
        switch (dir) { //spelaren går:
            case "up": // upp
                player.y -= player.y - (obstacle.y + obstacle.height)
                break;
            case "down": //ner
                player.y += obstacle.y - (player.y + player.hitbox.height)
                break;
            case "right": //höger
                player.x += obstacle.x - (player.x + player.hitbox.width)
                break;
            case "left": //vänster
                player.x -= player.x - (obstacle.x + obstacle.width)
                break;
            default:
                break;
        }
    }

    function isCollideItems(player, obstacles) {
        let isColliding = -1
        obstacles.forEach((o, index) => { //[]
            if (!(((player.y + player.height) < (o.y)) ||
                (player.y > (o.y + o.height)) ||
                ((player.x + player.width) < o.x) ||
                (player.x > (o.x + o.width)))) { //om alla false
                isColliding = index
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

    function updateInventoryHTML() {
        $("#inventory").empty();
        for (const type in player.inventory) {
            $("#inventory").append(`<li>${capitalizeFirstLetter(type)} ${player.inventory[type]}</li>`)
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function checkDir() {
        for (const dir in dirs) {
            if (dirs[dir]) {
                player.dir = dir
            }
        }
    }

    $(window).keydown((e) => {
        let key = e.which
        //console.log(key)
        switch (key) {
            case 65: //a
                keys.left = true
                dirs.a = true
                player.dir = 'a'
                break
            case 68: //d
                keys.right = true
                dirs.d = true
                player.dir = 'd'
                break
            case 83: //s
                keys.down = true
                dirs.s = true
                player.dir = 's'
                break
            case 87: //w
                keys.up = true
                dirs.w = true
                player.dir = 'w'
                break
            case 32: //space
                e.preventDefault()
                console.log("space")
                break
            case 70: //f
                keys.item = true
                break
            default:
                break
        }
    })

    $(window).keyup((e) => {
        let key = e.which
        switch (key) {
            case 65: //a
                keys.left = false
                dirs.a = false
                break
            case 68: //d
                keys.right = false
                dirs.d = false
                break
            case 83: //s
                keys.down = false
                dirs.s = false
                break
            case 87: //w
                keys.up = false
                dirs.w = false
                break
            case 70:
                keys.item = false
                break
            default:
                break
        }
        checkDir()
    })
}