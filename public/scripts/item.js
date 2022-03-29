class Item extends Collision_base{
    constructor(height, width, x, y, itemtype) {
        super(height, width, x, y)
        this.itemtype = itemtype
        switch (itemtype) {
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

    // rita ut itemet i canvasen
    draw() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    // skapa ett item från ett vanligt javascript-objekt
    static objToItem(obj) {
        return new Item(obj.height, obj.width, obj.x, obj.y, obj.itemtype)
    }
}
