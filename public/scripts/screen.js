class Screen {
    constructor(number, nextScreens, active) {
        this.number = number
        this.nextScreens = nextScreens
        this.obstacles = []
        this.items = []
        this.characters = []
        this.active = active
    }

    addBorders() {
        for (let i = 0; i < this.obstacles.length; i++) { //ta bort alla borders
            if (this.obstacles[i].type == "border") {
                this.obstacles.splice(i, 1)
                i--
            }
        }
        this.nextScreens.forEach((n, i) => { //lägg till nya
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

    addObstacle(o) {
        this.obstacles.push(o)
    }

    addCharacter(c) {
        this.characters.push(c)
    }

    removeObstacles() {
        this.obstacles.forEach(o => {
            if (o.type !== "border") {
                this.obstacles.splice(this.obstacles.indexOf(o))
            }
        })
    }

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

    //läs från json-fil
    static from(json) {
        //console.log(json);
        let s = new Screen(json.number, json.nextScreens, json.active)
        //console.log(json.obstacles);
        json.obstacles.forEach(o => {
            s.obstacles.push(new Obstacle(o.width, o.height, o.x, o.y, o.type))
        })
        json.items.forEach(i => {
            s.items.push(new Item(i.width, i.height, i.x, i.y, i.type))
        })
        s.characters = []
        //console.log('sssssssssss');
        //console.log(s);
        return s
    }
}