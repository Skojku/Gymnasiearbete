function game() {
    var speed = 200
    canvas.height = 500
    canvas.width = 500

    var screens = []

    var keys = {
        up: false,
        down: false,
        right: false,
        left: false,
        item: false
    }

    var dirs = {
        a: false,
        d: false,
        w: false,
        s: false
    }
    let promise_getWorld = new Promise((resolve, reject) => {
        console.log('getworld');
        $.get("/world_file", (data) => {
            console.log(data);
            data.forEach(s => {
                screens.push(Screen.from(s))
            })
            //console.log('---------------------');
            //console.log(screens)
            resolve(screens)
        })
    }).then(() => {
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
                    if (user.id === c.id) {
                        player = new Character(user.x, user.y, 'green', user.name)
                        console.log(user)
                        player.inventory = user.inventory
                        updateInventoryHTML()
                    } else {
                        let newCharacter = new Character(c.x, c.y, 'blue', c.name)
                        newCharacter.draw()
                        screens[c.screen].characters.push(newCharacter)
                    }
                })
            })
        
            socket.on('new_character', (user) => {
                //screens.find((s1) => { return s1.number === s }).characters.push(new Character(x, y, 'green', name))
                screens[user.screen].characters.push(new Character(user.x, user.y, 'blue', user.name))
            })
        
            socket.on('remove_character', (user) => {
                screens[user.screen].characters.splice(screens[user.screen].characters.indexOf(screens[user.screen].characters.find((c) => { return c.name === user.name })), 1)
            })
        
            socket.on('position', (user, dir, walking) => { //ändra andras position
                //console.log(screens[user.screen]);
                let characters = screens[user.screen].characters
                for (let i = 0; i < characters.length; i++) {
                    if (user.name === characters[i].name) {
                        characters[i].updatePosition(user.pos)
                        characters[i].dir = dir
                        characters[i].walking = walking
                    }
                }
            })
        
            socket.on('player_standing', (user) => {
                console.log(user.screen);
                screens[user.screen].characters.forEach(c => {
                    if (c.name === user.name) {
                        c.stand()
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
        
            socket.on('item thrown', (screen_nr, item) => {
                console.log('item thrown');
                console.log(item);
                screens.forEach(s => {
                    if (s.number === screen_nr) {
                        s.items.push(Item.objToItem(item))
                    }
                })
            })
        
            let previous_timestamp
            let counter = 0 //counter för att veta när man ska ändra animationssteg
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
                        let i = isCollide(player, screen.items, dx, dy)
                        if (i !== -1 && !player.inventoryFull(screen.items[i])) {
                            player.addItem(screen.items[i])
                            updateInventoryHTML()
                            screen.items.splice(i, 1)
                            socket.emit('item taken', screen.number, i)
                        }
                        //player.printInventory()
                    }
                    if (keys.throw) {
                        console.log('kasta');
                    }
                    if (moving) {
                        if (counter === 5) {
                            counter = 0
                            player.walk()
                        } else {
                            counter++
                        }
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
                        socket.emit('position', [player.x, player.y], player.dir, player.walking)
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
        
            function checkIfNewScreen() {
                screen.nextScreens.forEach((n, i) => {
                    if (n != -1) {
                        let change = false
                        switch (i) {
                            case 0:
                                if (player.x < 0) { //vänster
                                    player.x = canvas.width - player.hitbox.width
                                    change = true
                                }
                                break
                            case 1:
                                if (player.y < 0) { //upp
                                    player.y = canvas.height - player.hitbox.height
                                    change = true
                                }
                                break
                            case 2:
                                if (player.x + player.hitbox.width > canvas.width) { //höger
                                    player.x = 0
                                    change = true
                                }
                                break
                            case 3:
                                if (player.y + player.hitbox.height > canvas.height) { //ner
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
                            //console.log('n: ' + n);
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
        
            function updateInventoryHTML(markedItemType) {
                $("#inventory").empty()
                for (const itemtype in player.inventory) {
                    $("#inventory").append(`<li class="inventoryItem" data-selected="false">${capitalizeFirstLetter(itemtype)} ${player.inventory[itemtype]}</li>`)
                }
                if (markedItemType) {
                    $("ul#inventory li").each(function () {
                        if ($($(this)).text().split(" ")[0].toLowerCase() === markedItemType) {
                            $($(this)).attr("data-selected", "true")
                            $($(this)).css('outline', 'solid 1px')
                        }
                    })
                }
                $("ul#inventory li").click(function () {
                    $("ul#inventory li").each(function (index) {
                        $($(this)).attr("data-selected", "false")
                        $($(this)).css('outline', '')
                    })
                    $($(this)).attr("data-selected", "true")
                    $($(this)).css('outline', 'solid 1px')
                })
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
        
            function checkIfStanding() {
                let moving = false
                for (const key in keys) {
                    if (keys[key]) {
                        moving = true
                    }
                }
        
                if (!moving) {
                    player.stand()
                    socket.emit('player_standing')
                }
            }
        
            function throwItem() {
                let type
                $("ul#inventory li").each(function () {
                    if ($($(this)).attr("data-selected") === "true") {
                        type = $($(this)).text().split(" ")[0].toLowerCase()
                    }
                })
                if (type) {
                    let item = new Item(20, 20, player.x, player.y, type)
                    screen.items.push(item)
                    player.throwItem(item)
                    updateInventoryHTML(type)
                    socket.emit('item thrown', screen.number, item)
                } else {
                    for (const key in keys) {
                        keys[key] = false
                    }
                    for (const dir in dirs) {
                        dirs[dir] = false
                    }
                    checkIfStanding()
                    alert('Choose an item to throw (click inventory)')
                }
            }
            
            $(window).keydown((e) => {
                let key = e.which
                // console.log(key)
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
                    case 67: //c
                        throwItem()
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
                checkIfStanding()
            })
    })
}