//get CVS
const cvs = document.getElementById("runForrestRun");
const ctx = cvs.getContext("2d");

let frames = 0;
let SPEED = 5;
let acceleration = 1;

// GAME STATE
const state = {
    current: 0,
    getReady: 0,
    playing: 1,
    gameOver: 2,
}

// LOAD SOUND
const SCORE = new Audio();
SCORE.src = "audio/point.wav"

const HIT = new Audio();
HIT.src = "audio/hit.wav"

// Start Button
const startBtn = {
    x: 225,
    y: 318,
    w: 153,
    h: 51
}

//SWITCH STATE OF GAME - USE CLICK
cvs.addEventListener("click", (event) => {
    switch (state.current) {
        case state.getReady:
            state.current = state.playing;
            break;
        case state.playing:
            man.jumping();
            break;
        case state.gameOver:
            let rect = cvs.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let clickY = event.clientY - rect.top;

            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                animal.reset();
                score.reset();
                state.current = state.getReady;
            }
            break;  
    } 
});

//SWITCH STATE OF GAME - USE SPACE BAR
document.body.addEventListener("keyup", (event) => {
    if (event.keyCode===32) {
        switch (state.current) {
            case state.getReady:
                state.current = state.playing;
                break;
            case state.playing:
                man.jumping();
                break;
            case state.gameOver:
                    animal.reset();
                    score.reset();
                    state.current = state.getReady;
                break;
        }
    }
});

//BACKGROUND
const bg = {
    w: 1414,
    h: 400,
    x: 0,
    y: cvs.height - 400,

    speed: SPEED / 5 * 3, // speed of background is only 2/3 speed of foreground

    draw: function () {
        const image = new Image();
        image.src = "img/bg.png";
        ctx.drawImage(image, this.x, this.y, this.w, this.h);
        ctx.drawImage(image, this.x + this.w, this.y, this.w, this.h); // draw 2nd background if 1st one passed screen, make sure background is continuously
    },
    update: function () {
        if (state.current === state.playing) {
            this.x = (this.x - this.speed) % (this.w);
            this.speed = SPEED / 5 * 3; //update new speed of background

        }

    }

}

//FOREGROUND
const fg = {
    w: 4000,
    h: 400,
    x: 0,
    y: cvs.height - 400,

    speed: SPEED,

    draw: function () {
        const image = new Image();
        image.src = "img/fg.png";
        ctx.drawImage(image, this.x, this.y, this.w, this.h);
        ctx.drawImage(image, this.x + this.w, this.y, this.w, this.h); // draw 2nd foreground if 1st one passed screen, make sure foreground is continuously
    },
    update: function () {
        if (state.current === state.playing) {
            this.x = (this.x - this.speed) % (this.w) // if foreground.x exceed foreground.weight, then return foreground.x to 0 (new loop)
            this.speed = SPEED; //update new speed
        }
    }

}

//MAN
const man = {
    w: 88,
    h: 120,
    x: 70,
    y: cvs.height - 78 - 120, //78: height of the ground, 120: height of man

    frame: 0, // use to monitor 6 animation frames of running man

    fallingSpeed: 0,
    gravity: 0.45,
    jump: 11.5,


    draw: function () {
        const image = new Image();
        image.src = `img/fr${this.frame}.png`;
        ctx.drawImage(image, this.x, this.y, this.w, this.h);
    },

    jumping: function () {
        if (this.y === cvs.height - this.h - 78) {
            this.fallingSpeed = -this.jump;
        }

    },
    update: function () {
        // CHANGE FRAME OF MAN TO SHOW ANIMATION OF RUNNING
        if (state.current !== state.gameOver) {
            // period: thời gian giữa 2 lần đổi khung chuyển động chạy
            this.period = state.current === state.getReady ? 25 : 15;
            this.frame += frames % this.period === 0 ? 1 : 0; // change frame of running after 
            if (this.frame === 6) { this.frame = 0 } // because there are only 6 frames

            // if man jump, gravity will pull him down
            this.fallingSpeed += this.gravity;
            this.y += this.fallingSpeed;
            // if he is on the ground, keep y
            if (this.y >= cvs.height - this.h - 78) {
                this.y = cvs.height - this.h - 78;
            }
        }

    },
}

//ANIMAL AS OBSTACLE 
const animal = {
    w: [100, 95, 87, 105, 101, 140], // w of 6 animals in img folder
    h: [45, 70, 70, 66, 90, 72], // h of 6 animals in img folder
    speed: SPEED,
    y: [377, 352, 352, 356, 332, 350],  // y= cvs.height - animal.h - 78 (height of ground)
    position: [], // array of animals will appear in canvas

    draw: function () {
        this.position.forEach((element) => {
            const image = new Image();
            image.src = `img/an${element.kind}.png`;
            ctx.drawImage(image, element.x, this.y[element.kind], this.w[element.kind], this.h[element.kind]);
        });
    },
    update: function () {
        if (state.current !== state.playing) return;
        if (frames % 130 === 0) {
            this.position.push({
                x: cvs.width + Math.floor(Math.random() * 30), // random distance between 2 animals (but always >=130 frames)
                kind: Math.floor(Math.random() * 6) // random choose 1 in 6 animals in img
            })
        }
        this.position.forEach((element) => {

            //COLLISION DETECTION
            if (man.x + man.w - 20 > element.x && man.x + 25 < element.x + this.w[element.kind] && man.y + man.h > this.y[element.kind] + 20) {
                state.current = state.gameOver;
                HIT.play();
            }
            element.x -= SPEED; // if no collision happened, move animals to the left
            if (element.x + this.w[element.kind] < 0) {
                this.position.shift(); // if animal go beyond the canvas, delete from array
                score.value += 1;
                SCORE.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        })
    },
    reset: function () {
        this.position = [];
    }
}

// SCORE

const score = {
    best: parseInt(localStorage.getItem("best")) || 0, // If local Storage  has not stored any data, return to 0
    value: 0,
    draw: function () {


        if (state.current == state.playing) {
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";

            ctx.lineWidth = 3;
            ctx.font = "50px Teko";

            ctx.fillText(this.value, cvs.width / 2, 70)
            ctx.strokeText(this.value, cvs.width / 2, 70)

        } else if (state.current == state.gameOver) {

            ctx.font = "50px Teko";
            ctx.lineWidth = 3;
            ctx.textAlign = "center";
            ctx.textBaseline = "hanging";
            // DRAW score 
            ctx.fillText(this.value, 220, 220);
            ctx.strokeText(this.value, 220, 220);
            // DRAW best score
            ctx.fillText(this.best, 395, 220)
            ctx.strokeText(this.best, 395, 220)

        }
    },
    reset: function () {
        this.value = 0;
    }
}

//GET READY SCREEN
const getReady = {
    w: 405,
    h: 86,
    x: cvs.width / 2 - 405 / 2,
    y: 123,

    draw: function () {
        if (state.current === state.getReady) {
            const image = new Image();
            image.src = "img/getReady.png";
            ctx.drawImage(image, this.x, this.y, this.w, this.h);
        }

    }
}


//GAME OVER SCREEN
const gameOver = {
    w: 426,
    h: 309,
    x: cvs.width / 2 - 426 / 2,
    y: 60,

    draw: function () {
        if (state.current === state.gameOver) {
            const image = new Image();
            image.src = "img/gameOver.png";
            ctx.drawImage(image, this.x, this.y, this.w, this.h);
        }

    }
}

// FILL ctx with color and draw element
function draw() {
    ctx.fillStyle = "#c6f5ea";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    fg.draw();
    man.draw();
    animal.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

//UPDATE state of each element
function update() {
    man.update();
    animal.update();
    fg.update();
    bg.update();
}

// Loop update and re-draw canvas
function loop() {
    update();
    draw();
    frames++;
    if (frames % 600 == 0) { acceleration *= -1 };
    if (frames % 200 == 0) { SPEED += 0.5 * acceleration };
    requestAnimationFrame(loop);
}
loop();