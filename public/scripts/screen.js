class Screen {
    constructor(number, nextScreens, active) { 
        this.number = number
        this.nextScreens = nextScreens
        this.obstacles = []
        this.items = []
        this.characters = []
        this.active = active
    }

    // lägg till borders på alla sidor som inte leder till en annan skärm
    addBorders() {
        for (let i = 0; i < this.obstacles.length; i++) { //ta bort alla borders
            if (this.obstacles[i].type == "border") {
                this.obstacles.splice(i, 1)
                i--
            }
        }
        this.nextScreens.forEach((n, i) => { //lägg till nya borders
            if (n === -1) {
                switch (i) {
                    case 0:
                        this.obstacles.push(new Obstacle(5, 500, -5, 0, "border"))
                        break;
                    case 1:
                        this.obstacles.push(new Obstacle(500, 5, 0, -5, "border"))
                        break;
                    case 2:
                        this.obstacles.push(new Obstacle(5, 500, 500, 0, "border"))
                        break;
                    case 3:
                        this.obstacles.push(new Obstacle(500, 5, 0, 500, "border"))
                        break;
                    default:
                        break;
                }
            }
        })
    }

    // lägg till ett item
    addItem(i) {
        this.items.push(i)
    }

    // ta bort alla items
    removeItems() {
        this.items = []
    }

    // lägg till ett obstacle
    addObstacle(o) {
        this.obstacles.push(o)
    }

    // lägg till en karaktär
    addCharacter(c) {
        this.characters.push(c)
    }

    // ta bort alla obstacles som inte är borders
    removeObstacles() {
        this.obstacles.forEach(o => {
            if (o.type !== "border") {
                this.obstacles.splice(this.obstacles.indexOf(o))
            }
        })
    }

    // rita ut allt på skärmen
    draw() {
        this.obstacles.forEach((o) => {
            o.draw()
        })
        this.items.forEach(i => {
            i.draw()
        })
        this.characters.forEach((c) => {
            c.draw()
        })
    }

    //läs från json-fil och skapa en ny skärm
    static from(json) {
        let s = new Screen(json.number, json.nextScreens, json.active)
        json.obstacles.forEach(o => {
            s.obstacles.push(new Obstacle(o.width, o.height, o.x, o.y, o.type))
        })
        json.items.forEach(i => {
            s.items.push(new Item(i.width, i.height, i.x, i.y, i.itemtype))
        })
        s.characters = []
        return s
    }
}