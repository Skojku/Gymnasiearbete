const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const session = require('express-session')
const db_handler = require('./db_handler')
const md5 = require('md5')

const fs = require('fs')

const { randomBytes } = require('crypto')
var online_users = []
var items = {}

// --------TODO---------
//x world editor (fixa items)
//x fixa items och inventory
//x BÄTTRE COLLISION
//x fixa sprites
// databas --fixa delete funktionalitet
// fixa f5 --fixa så att items inte respawnar hos klienten
// lägg till items i editor

var req1

app.use(express.static('./public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
    secret: randomBytes(4).toString('hex'),
    resave: true,
    saveUninitialized: false
}))

// --------routes----------

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/game')
    } else {
        res.sendFile(__dirname + '/public/html/login.html')
    }
})

app.get('/game', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/public/html/index.html')
    } else {
        res.redirect('/')
    }
})

app.get('/world_file', (req, res) => {
    console.log('ayo')
    fs.readFile('world_file.json', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        JSON.parse(data).forEach(d => { //spara items på servern istället för hos klienten
            items[d.number] = d.items
        })
        res.setHeader('Content-Type', 'application/json')
        res.send(data)
    })
})

app.get('/editor', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/public/html/editor.html')
    } else {
        res.redirect('/')
    }
})

app.post('/update_world', (req, res) => {
    fs.writeFileSync("world_file.json", JSON.stringify(req.body, null, 4))
})

app.get('/username', (req, res) => {
    if (req.session.loggedIn) {
        //console.log(req.session.username)
        res.send(req.session.username)
    } else {
        res.redirect('/')
    }
})

app.get('/user', (req, res) => {
    if (req.session.loggedIn) {
        db_handler.get_user_by_id(req.session.user.id)
            .then(response => {
                console.log(response)
                res.send(response)
            })
            .catch(error => {
                console.log(error)
                res.redirect('/')
            })
    } else {
        res.redirect('/')
    }
})

app.get('/users', (req, res) => {
    db_handler.get_all_users()
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        })
})

app.get('/create_user', (req, res) => {
    res.sendFile(__dirname + '/public/html/create_user.html')
})

app.post('/logout', (req, res) => {
    console.log('logout------------------------');
    req.session.destroy()
    req1 = null
    res.send()
    //res.redirect('/')
})

app.put('/update_user', (req, res) => {
    console.log('update_user------------------------')
    let update = req.body
    update.id = req.session.user.id
    //console.log(update);
    db_handler.update_user(update)
        .then(response => {
            console.log(response)
            //console.log('success');
        })
        .catch(error => {
            console.log(error)
            //console.log('error');
        })
    res.send()
})

app.post('/login', (req, res) => {
    req1 = req
    const loginuser = req.body
    if (!loginuser.username || !loginuser.password) {
        console.log('login unsuccessful')
    }

    db_handler.get_all_users()
        .then(users => {
            users.forEach(u => {
                if (loginuser.username === u.name && md5(loginuser.password) === u.password) {
                    console.log('login successful')
                    req.session.id = u.id
                    req.session.loggedIn = true
                    if (loginuser.editor === "on") {
                        res.redirect('/editor')
                    } else {
                        req1.session.user = {
                            id: u.id,
                            name: u.name,
                            screen: u.screen,
                            x: u.x,
                            y: u.y
                        }

                        db_handler.get_inventory_by_userid(u.id)
                            .then(respons => {
                                // console.log('inventory');
                                // console.log(respons);
                                req1.session.user.inventory = {}
                                respons.forEach(i => {
                                    req1.session.user.inventory[i["itemtype"]] = i["count"]
                                })
                                // console.log('user');
                                // console.log(req1.session.user.inventory);
                                res.redirect('/game')
                            })
                            .catch(error => {
                                console.log(error)
                                res.redirect('/')
                            })
                    }
                }
            })
            if (!req.session.loggedIn) {
                res.redirect('/')
                console.log('no matching user')
            }
        })
        .catch(error => {
            res.redirect('/')
            console.log(error);
        })

})

app.post('/create_user', (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let password2 = req.body.password2
    db_handler.create_user(username, password, password2)
        .then(response => {
            console.log(response)
            res.redirect('/')
        })
        .catch(error => {
            console.log(error)
            res.redirect('/create_user')
        })
})

// -----------socket shit------------

io.on('connection', (socket) => {
    if (req1) {
        socket.user = req1.session.user
        //(socket.user);
        console.log('a user connected')
        online_users.push(socket.user)

        //----page----
        socket.emit("active_users", online_users.map(u => { return u.name })) //skicka enbart användarnamnen
        //console.log("------online_users------")
        //console.log(online_users)
        socket.broadcast.emit("user_connected", socket.user.name)

        //----game----
        console.log('clientsCount = ' + io.engine.clientsCount)

        let characters = [] //lista med alla aktiva karaktärer
        io.sockets.sockets.forEach(sock => {
            if (sock.user) { //ibland skapas en extra socket vid connection, inte bra
                characters.push(sock.user)
            }
        })
        //console.log(characters);
        socket.emit('player', socket.user, characters) //skapar sin egen karaktär samt alla andras
        socket.broadcast.emit('new_character', socket.user) //lägger till karaktären till alla andra
    } else {
        io.emit('server_restart') //för att inte krascha servern
    }

    socket.on('disconnect', (reason) => {
        online_users.splice(online_users.indexOf(socket.user), 1)
        console.log('a user disconnected because of ' + reason)
        console.log("------online_users------")
        console.log(online_users)
        io.emit("active_users", online_users.map(u => { return u.name }))
        io.emit("remove_character", socket.user)
    })

    socket.on("pong", () => {
        console.log('pong')
        socket.emit('update_user')
    })

    socket.on('position', (pos, dir, walking) => { //uppdatera position och skicka till andra
        socket.user.pos = pos
        //console.log(socket.user.name)
        socket.broadcast.emit('position', socket.user, dir, walking)
    })

    socket.on('change_screen', (screen, newScreen) => { //uppdatera skärm och skicka till andra
        socket.user.screen = newScreen
        //console.log(socket.user.name + " screeeeen");
        socket.broadcast.emit('change_screen', screen, newScreen, socket.user.name)
    })

    socket.on('player_standing', () => {
        socket.broadcast.emit('player_standing', socket.user)
    })

    socket.on('item taken', (screen_nr, item_index) => {
        socket.broadcast.emit('item taken', screen_nr, item_index)
    })
})

server.listen(8080, () => {
    console.log('Server listening on port 8080')
})