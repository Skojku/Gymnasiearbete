class Character{
    constructor(height, width, x, y, color, username) {
        this.height = 23 * 2.2
        this.width = 18 * 2.2
        this.x = x
        this.y = y
        this.color = color
        this.username = username
        this.inventory = {}
    }

    inventoryFull(item) {
        if (item.type in this.inventory) {
            if (item.stack_size == this.inventory[item.type]) {
                return true
            }
        }
        return false
    }

    addItem(i) {
        if (i.type in this.inventory) {
            this.inventory[i.type]++
        } else {
            this.inventory[i.type] = 1
        }
    }

    printInventory() {
        for (const key in this.inventory) {
            console.log(key + " " + this.inventory[key]);
        }
    }

    updatePosition(pos) {
        this.x = pos[0]
        this.y = pos[1]
    }

    move(dx, dy) {
        this.x += dx
        this.y += dy

    }

    moveX(speed) {
        this.x += speed
    }

    moveY(speed) {
        this.y += speed
    }

    draw() {
        ctx.drawImage(playersheet, 2, 3, 18, 23, this.x, this.y, this.width, this.height)
        /* ctx.fillStyle = this.color
        ctx.font = "20px Comic Sans MS"
        let x = (this.username.length*10)/2
        ctx.fillText(this.username, this.x-x+(this.width/2), this.y-2)
        ctx.fillRect(this.x, this.y, this.width, this.height) */
    }

    createCharacter(json) {
        this.height = json.height
        this.width = json.width
        this.x = json.x
        this.y = json.y
        this.color = json.color
        this.username = json.username
        this.inventory = []
    }
}