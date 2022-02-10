class Screen {
    constructor(number, nextScreens, active, ctx) {
        this.number = number
        this.nextScreens = nextScreens
        this.obstacles = []
        this.characters = []
        this.active = active
        nextScreens.forEach((n, i) => {
            if (n === 0) {
                switch (i) {
                    case 0:
                        this.obstacles.push(new Obstacle(5, 500, -5, 0, ctx, "border"))
                        break;
                    case 1:
                        this.obstacles.push(new Obstacle(500, 5, 0, -5, ctx, "border"))
                        break;
                    case 2:
                        this.obstacles.push(new Obstacle(5, 500, 500, 0, ctx, "border"))
                        break;
                    case 3:
                        this.obstacles.push(new Obstacle(500, 5, 0, 500, ctx, "border"))
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

    draw() {
        this.obstacles.forEach((o) => {
            o.draw()
        })
        this.characters.forEach((c) => {
            c.draw()
        })
    }
}