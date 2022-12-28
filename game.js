const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const player_image = new Image();
player_image.src = 'https://www.nicepng.com/png/full/13-138961_vector-spaces-ship-8-bit-spaceship-sprite.png';

const background_image = new Image();
background_image.src = 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg';

let playerX = CANVAS_WIDTH/2;
let playerSpeed = 0;
let enemyX = 150;
let enemyY = 5;

const enemies = [];
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 2;
        this.active = true;
    }

    draw(ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

    moveX() {
        this.x += this.speed;
    }

    moveY() {
        this.y += this.height+10;
    }

    tick() {
        //Tick logic
        if(this.x >= CANVAS_WIDTH-this.width) {
            this.moveY();
            this.x = this.width;
            this.speed += 2
        }
        else {
            this.moveX();
        }
    }
}

const bullets = [];
class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speed = speed;
        this.active = true;
    }

    tick() {
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }

    checkCollision(enemy) {
        let dx = Math.abs(this.x - enemy.x);
        let dy = Math.abs(this.y - enemy.y);

        if (dx < (enemy.width + this.size)/2 && dy < (enemy.height + this.size)/2) {
            return true;
        } else {
            return false;
        }
    }
}

function shoot() {
    let bullet = new Bullet(playerX, CANVAS_HEIGHT-50, 4)
    bullets.push(bullet);
}

function onKeyDown(event) {
    let key = event.key;
    if (key == "ArrowLeft") {
        playerSpeed = -2;
    } else if (key == "ArrowRight") {
        playerSpeed = 2;
    } else if (key == " ") {
        shoot();
    }
}
function onKeyUp(event) {
    let key = event.key;
    if (key == "ArrowLeft") {
        playerSpeed = 0;
    } else if (key == "ArrowRight") {
        playerSpeed = 0;
    }
}
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;

function onTouchStart(event) {
    let pos = event.touches[0];
    if(pos.clientX > CANVAS_WIDTH/2) {
        playerSpeed = 2;
    }
    else if(pos.clientX < CANVAS_WIDTH/2) {
        playerSpeed = -2;
    }
}
function onTouchEnd(event) {
    playerSpeed = 0;
}

function animate() {
    // Draw the background
    ctx.drawImage(background_image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw the player
    ctx.drawImage(player_image, playerX-25, CANVAS_HEIGHT-50, 50, 50);

//    ctx.fillStyle = "#FF0000";
//    ctx.fillRect(enemyX-25, enemyY, 50, 50);

    playerX += playerSpeed;

    // Tick and draw the enemies
    let i=0;
    while (i < enemies.length) {
        let enemy = enemies[i];
        if (enemy.active) {
            enemy.tick();
            enemy.draw(ctx);
        }
        i = i + 1;
    }

    // Tick and draw the bullets
    i=0;
    while (i < bullets.length) {
        let bullet = bullets[i];
        if (bullet.active) {
            bullet.tick();
            bullet.draw(ctx);

            // Check for collisions and misses
            let hit = false;
            for (let j=0; j<enemies.length; j++) {
                enemy = enemies[j];
                if (enemy.active) {
                    if (bullet.checkCollision(enemy)) {
                        bullet.active = false;
                        enemy.active = false;
                        console.log("hit!");
                    } else if(bullet.y < 0) {
                        bullet.active = false;
                        console.log("miss!");
                    }
                }
            }
        }

        i++;
    }
    
    requestAnimationFrame(animate);
}

function main() {
    enemies.push(new Enemy(50, 50));
    enemies.push(new Enemy(200, 50));
    enemies.push(new Enemy(125, 50));
    animate();
}
main();
