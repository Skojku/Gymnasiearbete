class Obstacle extends Collision_base {
    constructor(width, height, x, y, type) {
        super(height, width, x, y)
        this.type = type
    }

    // ritar ut obstaclen
    draw() {
        if (this.type == "bush") {
            ctx.fillStyle = '#047015'
        } else if (this.type == "stone") {
            ctx.fillStyle = '#61636b'
        } else if (this.type == "tree") {
            ctx.fillStyle = '#15ed61'
        } else if (this.type == "border") {
            ctx.fillStyle = 'red'
        }
        ctx.fillRect(this.x,this.y,this.width,this.height)
    }

    // skapar en obstacle från ett json-objekt
    createObstacle(json) {
        this.height = json.height
        this.width = json.width
        this.x = json.x
        this.y = json.y
        this.type = json.type
    }
}
