class Obstacle extends Collision_base {
    constructor(width, height, x, y, ctx, type) {
        super(height, width, x, y, ctx)
        this.type = type
    }

    draw() {
        if (this.type == "bush") {
            this.ctx.fillStyle = '#047015'
        } else if (this.type == "stone") {
            this.ctx.fillStyle = '#61636b'
        } else if (this.type == "tree") {
            this.ctx.fillStyle = '#15ed61'
        } else if (this.type == "border") {
            this.ctx.fillStyle = 'red'
        }
        this.ctx.fillRect(this.x,this.y,this.width,this.height)
    }
}