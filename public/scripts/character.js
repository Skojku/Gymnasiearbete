class Character{
    constructor(height, width, x, y, color, username) {
        this.height = 23 * 2.2
        this.width = 18 * 2.2
        this.x = x
        this.y = y
        this.color = color
        this.username = username
        this.inventory = {}
        this.dir = 's'
        this.walking = 0
        this.hitBox = {
            width: 40,
            height: 40
        }
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
        //ctx.drawImage(playersheet, 2, 3, 18, 23, this.x, this.y, this.width, this.height)
        let x
        let y
        let width
        let height
        if (this.walking === 0) {
            x = playersheet_pos.standing[this.dir][0]
            y = playersheet_pos.standing[this.dir][1]
            width = playersheet_pos.standing[this.dir][2]
            height = playersheet_pos.standing[this.dir][3]
        } else {
            x = playersheet_pos.walking[this.dir][0]
            y = playersheet_pos.walking[this.dir][1]
            width = playersheet_pos.walking[this.dir][2]
            height = playersheet_pos.walking[this.dir][3]
        }

        let ratio = 50/height < 50/width ? 50/height : 50/width
        this.width = width*ratio
        this.height = height*ratio
        //console.log(this.width);
        //console.log(this.height);
        ctx.drawImage(playersheet, x, y, width, height, this.x, this.y, this.width, this.height)
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