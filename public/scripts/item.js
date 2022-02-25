class Item extends Collision_base{
    constructor(height, width, x, y, type) {
        super(height, width, x, y)
        this.type = type
        switch (type) {
            case "rock":
                this.color = "#727080"
                this.stack_size = 3
                break;
            case "torch":
                this.color = "#e6e643"
                this.stack_size = 2
                break;
            case "brick":
                this.color = "#f2a922"
                this.stack_size = 3
                break;
            default:
                break;
        }
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}
