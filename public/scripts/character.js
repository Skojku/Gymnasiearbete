class Character{
    constructor(x, y, color, name) {
        this.height = 23 * 2.2
        this.width = 18 * 2.2
        this.x = x
        this.y = y
        this.color = color
        this.name = name
        this.inventory = {}
        this.dir = 's'
        this.walking = 0
        this.hitbox = {
            width: 35,
            height: 45
        }
    }

    inventoryFull(item) {
        if (item.itemtype in this.inventory) {
            if (item.stack_size == this.inventory[item.itemtype]) {
                return true
            }
        }
        return false
    }

    addItem(i) {
        if (i.itemtype in this.inventory) {
            this.inventory[i.itemtype]++
        } else {
            this.inventory[i.itemtype] = 1
        }
    }

    throwItem(i) {
        let type = i.itemtype
        // console.log(type);
        // console.log(this.inventory[type]);
        if (this.inventory[type] === 1) {
            delete this.inventory[type]
        } else {
            this.inventory[type]--
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

    walk() {
        if (this.walking == 10) {
            this.walking = 0
        } else {
            this.walking++
        }
    }

    stand() {
        this.walking = 0
    }

    draw() {
        let x_image, y_image, width, height
        if (this.walking === 0) {
            x_image = playersheet_pos.standing[this.dir][0]
            y_image = playersheet_pos.standing[this.dir][1]
            width = playersheet_pos.standing[this.dir][2]
            height = playersheet_pos.standing[this.dir][3]
        } else {
            x_image = playersheet_pos.walking[this.dir][this.walking][0]
            y_image = playersheet_pos.walking[this.dir][this.walking][1]
            width = playersheet_pos.walking[this.dir][this.walking][2]
            height = playersheet_pos.walking[this.dir][this.walking][3]
        }
        
        let ratio = 50/height < 50/width ? 50/height : 50/width
        this.width = width*ratio
        this.height = height*ratio
        let x = this.x - (this.width - this.hitbox.width)/2
        let y = this.y - (this.height - this.hitbox.height)/2
        ctx.drawImage(playersheet, x_image, y_image, width, height, x, y, this.width, this.height)

        ctx.font = '20px Comic Sans MS'
        ctx.fillStyle = this.color
        ctx.fillText(this.name, x - (this.name.length*10 - this.width)/2, this.y-5)
    }

    createCharacter(json) {
        this.height = json.height
        this.width = json.width
        this.x = json.x
        this.y = json.y
        this.color = json.color
        this.name = json.name
        this.inventory = []
    }
}