class Character extends Collision_base {
    constructor(height, width, x, y, ctx, color, username) {
        super(height, width, x, y, ctx)
        this.color = color
        this.username = username
        this.newX = x
        this.newY = y
    }

    updatePosition(pos) {
        this.x = pos[0]
        this.y = pos[1]
    }

    updateOwnPosition() {
        this.x = this.newX
        this.y = this.newY
    }

    resetNewPos() {
        this.newX = this.x
        this.newY = this.y
    }

    moveX(speed) {
        this.newX += speed
    }

    moveY(speed) {
        this.newY += speed
    }

    draw() {
        this.ctx.fillStyle = this.color
        this.ctx.font = "20px Comic Sans MS"
        let x = (this.username.length*10)/2
        this.ctx.fillText(this.username, this.x-x+(this.width/2), this.y-2)
        this.ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}