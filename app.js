const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const db_handler = require('./db_handler')
const md5 = require('md5')
const fs = require('fs')

const { randomBytes } = require('crypto')
var online_users = {}
var items = {}

// --------TODO---------
//x world editor (fixa items)
//x fixa items och inventory
//x BÄTTRE COLLISION
//x fixa sprites
//x fixa att man inte kan logga in som samma karaktär
//x fixa f5 --
// lägg till items i editor
// databas --fixa delete funktionalitet

// skapa session i servern
var session = require('express-session')({
    secret: randomBytes(4).toString('hex'),
    resave: true,
    saveUninitialized: true
})
var sharedsession = require('express-socket.io-session')
app.use(session)

app.use(express.static('./public')) // visa express var mappen för allt statiskt är
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// spara items på servern istället för hos klienten
fs.readFile('world_file.json', (err, data) => { //läs world_file.json
    if (err) {
        console.error(err)
        return
    }
    JSON.parse(data).forEach(d => { // spara alla items från world_file i objektet items
        items[d.number] = d.items // objektets keys är skärmarnas nummer 
    })
})

// --------routes----------

app.get('/', (req, res) => {
    if (req.session.loggedIn) { // om inte inloggad skicka till loginsidan
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

// läs world_file och skicka till klienten
app.get('/world_file', (req, res) => {
    fs.readFile('world_file.json', (err, data) => { 
        if (err) {
            console.error(err)
            return
        }
        let out = JSON.parse(data)
        for (let i = 0; i < out.length; i++) {
            out[i].items = items[i] //byt ut items från world_file till items från servern
        }
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(out))
    })
})

// updatera world_file med data från klienten samt återställ items objektet
app.post('/update_world', (req, res) => {
    items = {}
    req.body.forEach(s => {
        items[s.number] = s.items
    })
    fs.writeFileSync("world_file.json", JSON.stringify(req.body, null, 4))
})

app.get('/editor', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/public/html/editor.html')
    } else {
        res.redirect('/')
    }
})

// ta bort?
app.get('/username', (req, res) => {
    if (req.session.loggedIn) {
        //console.log(req.session.username)
        res.send(req.session.username)
    } else {
        res.redirect('/')
    }
})

// returnera userdata till klienten
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

// logga alla users i serverkonsollen 
app.get('/users', (req, res) => {
    db_handler.get_all_users()
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        })
})

//redirect till create_user.html
app.get('/create_user', (req, res) => {
    res.sendFile(__dirname + '/public/html/create_user.html')
})

// ta bort session och gå till loginsidan
app.post('/logout', (req, res) => {
    req.session.destroy()
    res.send()
})

// updatera user med data från klienten
app.put('/update_user', (req, res) => {
    let update = req.body
    Object.assign(req.session.user, update)
    update.id = req.session.user.id
    db_handler.update_user(update)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        })
    res.send()
})

// checka om logincredentials stämmer överens med de i databasen
app.post('/login', (req, res) => {
    const loginuser = req.body
    if (!loginuser.username || !loginuser.password) {
        console.log('login unsuccessful')
    }

    db_handler.get_all_users() 
        .then(users => {
            let alreadyLoggedIn
            users.forEach(u => { // loopa genom alla users i databasen
                if (loginuser.username === u.name && md5(loginuser.password) === u.password) { 
                    if (!(u.id in online_users)) { // om usern inte redan är inloggad
                        console.log('login successful')
                        req.session.id = u.id
                        req.session.loggedIn = true
                        if (loginuser.editor === "on") {
                            res.redirect('/editor')
                        } else { // om man inte ska till editorn: spara userns stats i sessionen
                            req.session.user = { 
                                id: u.id,
                                name: u.name,
                                screen: u.screen,
                                x: u.x,
                                y: u.y
                            }
    
                            db_handler.get_inventory_by_userid(u.id) // fyll userns inventory
                                .then(respons => {
                                    req.session.user.inventory = {}
                                    respons.forEach(i => {
                                        req.session.user.inventory[i["itemtype"]] = i["count"]
                                    })
                                    res.redirect('/game')
                                })
                                .catch(error => {
                                    console.log(error)
                                    res.redirect('/')
                                })
                        }
                    } else {
                        alreadyLoggedIn = true
                    }
                }
            })
            if (alreadyLoggedIn) {
                console.log('User already logged in')
                res.redirect('/')
            }
            else if (!req.session.loggedIn) {
                res.redirect('/')
                console.log('No matching user')
            }
        })
        .catch(error => {
            res.redirect('/')
            console.log(error);
        })
})

// skapa user och spara i databasen
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


// -----------socket------------

// använd samma session mellan express och socket.io
io.use(sharedsession(session, {
    autoSave:false
}))

io.on('connection', (socket) => { // vid anslutning av socket
    if (socket.handshake.session.user) { // om det finns en user i sessionen. Utan if-satsen kraschar servern om man startar om den när någon är inloggad
        socket.user = socket.handshake.session.user

        console.log('a user connected')
        online_users[socket.user.id] = socket.user

        //----page----
        io.emit("active_users", Object.values(online_users).map(a => a.name)) //skicka enbart användarnamnen till klienten
        
        console.log("------online_users------")
        console.log(online_users) // logga alla som är online i serverkonsollen

        //----game----
        console.log('clientsCount = ' + io.engine.clientsCount)

        let characters = [] // lista med alla aktiva karaktärer
        io.sockets.sockets.forEach(sock => { // loopa genom alla sockets
            if (sock.user) { // ibland skapas en extra socket vid anslutning, lägg därför bara till alla som har en user kopplad till sig
                characters.push(sock.user)
            }
        })
        socket.emit('player', socket.user, characters) //skapar sin egen karaktär samt alla andras
        socket.broadcast.emit('new_character', socket.user) //lägger till karaktären till alla andra
    } else {
        io.emit('server_restart') //för att inte krascha servern
    }

    socket.on('disconnect', (reason) => { // vid urkoppling av socket
        if (socket.user) {
            delete online_users[socket.user.id] // ta bort socketens user från online_users
            console.log('a user disconnected because of ' + reason)
            console.log("------online_users------")
            console.log(online_users)
            io.emit("active_users", Object.values(online_users).map(a => a.name)) // skicka alla aktiva användarnamn till kienten
            io.emit("remove_character", socket.user) // ta bort karaktären från alla andra klienter
        }
    })

    socket.on("pong", () => { // varje 25 sekunder skickar servern ett ping till varje socket för att se att den fortfarande är aktiv. Om den inte får tillbaka något stängs socketen ner
        console.log('pong')
        socket.emit('update_user') // passa på att uppdatera usern automatiskt
    })

    socket.on('position', (pos, dir, walking) => { // uppdatera position och skicka till andra
        socket.user.pos = pos
        socket.broadcast.emit('position', socket.user, dir, walking)
    })

    socket.on('change_screen', (screen, newScreen) => { // uppdatera skärm och skicka till andra
        socket.user.screen = newScreen
        socket.broadcast.emit('change_screen', screen, newScreen, socket.user.name)
    })

    socket.on('player_standing', () => { // säg till alla andra sockets att karaktären står stilla, dvs visa en viss sprite på karaktären
        socket.broadcast.emit('player_standing', socket.user)
    })

    socket.on('item taken', (screen_nr, item_index) => { // uppdatera itemsobjektet och alla andra sockets när någon plockar upp ett item
        items[screen_nr].splice(item_index, 1) // ta bort item från itemsobjektet
        socket.broadcast.emit('item taken', screen_nr, item_index)
    })

    socket.on('item thrown', (screen_nr, item) => { // lägg till item i itemsobjektet och uppdatera alla andra sockets när någon slänger ut ett item
        socket.broadcast.emit('item thrown', screen_nr, item);
        ['color', 'stack_size'].forEach(k => delete item[k])
        items[screen_nr].push(item)
    })
})

// lyssna på port 8080
server.listen(8080, () => {
    console.log('Server listening on port 8080')
})