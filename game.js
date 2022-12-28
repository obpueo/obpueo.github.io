const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const player_image = new Image();
player_image.src = 'https://www.nicepng.com/png/full/13-138961_vector-spaces-ship-8-bit-spaceship-sprite.png';

const background_image = new Image();
background_image.src = 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg';

let gameActive = false;
let playerX = CANVAS_WIDTH/2;
let playerSpeed = 0;
let enemyX = 150;
let enemyY = 5;
let bulletLimit = 2;
let score = 0;

const enemies = [];
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 3;
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

function spawnEnemies() {
    enemies.push(new Enemy(50, 50));
    enemies.push(new Enemy(200, 50));
    enemies.push(new Enemy(125, 50));
}

//-------------------------------------------------------------------
// User Interface

function setScore(newScore) {
    score = newScore;
    document.getElementById("score_text").innerHTML = "<b>Score: " + score + "</b>";
}

//-------------------------------------------------------------------
// Player Controls

function startMovingLeft() {
    playerSpeed = -2;
}
function startMovingRight() {
    playerSpeed = 2;
}
function stopMoving() {
    playerSpeed = 0;
}

function shoot() {
    if (bullets.length < bulletLimit) {
        let bullet = new Bullet(playerX, CANVAS_HEIGHT-50, 4)
        bullets.push(bullet);
    }
}

// Handle key presses
function onKeyDown(event) {
    let key = event.key;
    if (key == "ArrowLeft") {
        startMovingLeft();
    } else if (key == "ArrowRight") {
        startMovingRight();
    } else if (key == " ") {
        shoot();
    }
}
function onKeyUp(event) {
    let key = event.key;
    if (key == "ArrowLeft") {
        stopMoving();
    } else if (key == "ArrowRight") {
        stopMoving();
    }
}
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;

// Mouse controls
function onMouseDown(event) {
    let x = event.offsetX;
    if (x < CANVAS_WIDTH / 2) {
        startMovingLeft();
    } else if (x > CANVAS_WIDTH/2) {
        startMovingRight();
    }
}
function onMouseUp(event) {
    stopMoving();
}
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);

// Touch controls
function onTouchStart(event) {
    let x = event.touches[0].clientX;
    if (x < CANVAS_WIDTH/2) {
        startMovingLeft();
    }
    else if (x > CANVAS_WIDTH/2) {
        startMovingRight();
    }
}
function onTouchEnd(event) {
    playerSpeed = 0;
}
canvas.addEventListener("ontouchstart", onTouchStart);
canvas.addEventListener("ontouchend", onTouchEnd);

function animate() {
    if(gameActive) {
        // Draw the background
        ctx.drawImage(background_image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw the player
        ctx.drawImage(player_image, playerX-25, CANVAS_HEIGHT-50, 50, 50);
        
    //    ctx.fillStyle = "#FF0000";
    //    ctx.fillRect(enemyX-25, enemyY, 50, 50);
        if(playerX > 25){
            if(playerSpeed < 0) {
                playerX += playerSpeed;
            }
        }
        if(playerX < CANVAS_WIDTH-25) {
            if(playerSpeed > 0) {
                playerX += playerSpeed
            }
        }
        // Tick and draw the enemies
        let i=0;
        while (i < enemies.length) {
            let enemy = enemies[i];
            if (enemy.active) {
                enemy.tick();
                enemy.draw(ctx);
            }

            // Prune any deactivated enemies
            if (!enemy.active) {
                enemies.splice(i, 1);
            } else {
                i++;
            }
            // Check game end
            if(enemy.y >= CANVAS_HEIGHT-50) {
                gameActive = false
                enemies.splice(0, 3)
                document.getElementById('start_button').disabled = false;
                document.getElementById('start_button').style.opacity = '1';
                document.getElementById('background-start').style.opacity = '1';
            }
        }

        // Tick and draw the bullets
        i=0;
        while (i < bullets.length) {
            let bullet = bullets[i];
            if (bullet.active) {
                bullet.tick();
                bullet.draw(ctx);
            }

            // Prune any deactivated enemies
            if(bullet.y < 0) {
                // Bullet goes off the top of the screen
                bullet.active = false;
            }
            if (!bullet.active) {
                bullets.splice(i, 1);
            } else {
                i++;
            }
        }

        // Check for collisions between bullets and enemies
        for (i=0; i<bullets.length; i++) {
            let bullet = bullets[i];
            for (let j=0; j<enemies.length; j++) {
                let enemy = enemies[j];
                if (enemy.active) {
                    if (bullet.checkCollision(enemy)) {
                        bullet.active = false;
                        enemy.active = false;

                        setScore(score + 1);

                        /* Todo: Score, Explosion/Death animation, SFX*/
                    }
                }
            }
        }
        if(enemies.length < 1) {
            spawnEnemies();
        }
        requestAnimationFrame(animate);
    }
}

function main() {
    setScore(0);
    spawnEnemies();
    gameActive = true;
    animate();
    document.getElementById('start_button').disabled = true;
    document.getElementById('start_button').style.opacity = '0';
    document.getElementById('background-start').style.opacity = '0';
}

