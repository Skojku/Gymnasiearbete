const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const session = require('express-session')

const fs = require('fs')

var users = require('./hardcoded_database')
const { randomBytes } = require('crypto')
var online_users = []

// --------TODO---------
//x world editor (fixa items)
//x fixa items och inventory
//x BÄTTRE COLLISION
// fixa sprites
// databas
// fixa f5 

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

app.get('/user', (req, res) => {
    if (req.session.loggedIn) {
        //console.log(req.session.username)
        res.send(req.session.username)
    } else {
        res.redirect('/')
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy()
    res.send()
    //res.redirect('/')
})

app.post('/login', (req, res) => {
    req1 = req
    const user = req.body
    if (!user.username || !user.password) {
        console.log('login unsuccessful')
    }
    let login = false
    users.forEach(u => {
        if (user.username === u.username && user.password === u.password) {
            console.log('login successful')
            req1.session.username = user.username
            req.session.loggedIn = true
            login = true
            if (user.editor === "on") {
                res.redirect('/editor')
            } else {
                res.redirect('/game')
            }
        }
    })
    if (!login) {
        res.redirect('/')
        console.log('no matching user')
    }
})

// -----------socket shit------------

io.on('connection', (socket) => {
    if (req1) {
        user = {
            username: req1.session.username,
            pos: [200, 100],
            screen: 0
        }
        socket.user = user
        console.log('a user connected')
        online_users.push(socket.user)

        //----page----
        socket.emit("active_users", online_users.map(u => { return u.username })) //skicka enbart användarnamnen
        //console.log("------online_users------")
        //console.log(online_users)
        socket.broadcast.emit("user_connected", socket.user.username)

        //----game----
        console.log('-------------------------------')
        console.log(io.engine.clientsCount)

        let characters = [] //lista med alla aktiva karaktärer
        io.sockets.sockets.forEach(socket => {
            console.log("hej");
            if (socket.user) { //ibland skapas en extra socket vid connection, inte bra
                let character = {
                    username: socket.user.username,
                    pos: socket.user.pos,
                    screen: socket.user.screen
                }
                characters.push(character)
            }
        })
        console.log(characters);
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
        io.emit("active_users", online_users.map(u => { return u.username }))
        io.emit("remove_character", socket.user)
    })

    socket.on("pong", () => {
        console.log('pong')
    })

    socket.on('position', (pos) => { //uppdatera position och skicka till andra
        socket.user.pos = pos
        //console.log(socket.user.username)
        socket.broadcast.emit('position', socket.user)
    })

    socket.on('change_screen', (screen, newScreen) => { //uppdatera skärm och skicka till andra
        socket.user.screen = newScreen
        //console.log(socket.user.username + " screeeeen");
        socket.broadcast.emit('change_screen', screen, newScreen, socket.user.username)
    })

    socket.on('item taken', (screen_nr, item_index) => {
        socket.broadcast.emit('item taken', screen_nr, item_index)
    })
})

server.listen(8080, () => {
    console.log('Server listening on port 8080')
})