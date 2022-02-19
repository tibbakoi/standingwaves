/*
Standing waves demo

Author: Kat Young
https://github.com/tibbakoi
2022
*/

//size variables - using 1px = 1cm
// for reference, gen6 teaching room is 7m x 5.6m x 2.6m
let canvasSizeX = 700; // 7m wide
let canvasSizeY = 460; //4.6m deep
let markerSize = 15; //person head ~15cm wide?

// movement variables
let markerMovementInc = 5; //5cm increments
let markerPermitMovement = [1, 1, 1, 1]; //Left right up down

// starting position variables - bottom right
let markerPosX = canvasSizeX - 50;
let markerPosY = canvasSizeY - 10;

// audio variables
let osc1 = new p5.Oscillator('sine');
let playButton;
let oscStatus = 0;

function setup() {
    let canvas = createCanvas(canvasSizeX, canvasSizeY);
    canvas.parent('demo');
    frameRate(60);

    osc1.amp(0.15);
    osc1.freq(440);

    playButton = createButton('toggle play').position(0, 0, 'relative');
    playButton.mousePressed(playPauseAudio);
}

function draw() {
    //persisting elements
    background(255);
    noFill();
    stroke(0);
    rect(0, 0, canvasSizeX, canvasSizeY);
    drawDoor();

    //changing elements

    //changing marker location on keyPressed status rather than keyPressed function allows for press and hold
    if (keyIsPressed) {
        //Use arrow keys to move marker around in increments
        if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
            // determine where marker can go based on current position - is the next increment going to take outside of walls?
            if (markerPosX - markerMovementInc <= 0) { markerPermitMovement[0] = 0; } //can't go left
            if (markerPosX + markerMovementInc >= canvasSizeX) { markerPermitMovement[1] = 0; } //can't go right
            if (markerPosY - markerMovementInc <= 0) { markerPermitMovement[2] = 0; } //can't go up
            if (markerPosY + markerMovementInc >= canvasSizeY) { markerPermitMovement[3] = 0; } //can't go down

            //change marker position based on permitted movements
            if (keyCode === RIGHT_ARROW && markerPermitMovement[1]) {
                markerPosX = markerPosX + markerMovementInc;
            } else if (keyCode === LEFT_ARROW && markerPermitMovement[0]) {
                markerPosX = markerPosX - markerMovementInc;
            } else if (keyCode === UP_ARROW && markerPermitMovement[2]) {
                markerPosY = markerPosY - markerMovementInc;
            } else if (keyCode === DOWN_ARROW && markerPermitMovement[3]) {
                markerPosY = markerPosY + markerMovementInc;
            }

            // reset permitted movements for next key press
            markerPermitMovement = [1, 1, 1, 1];
        }
    }

    drawMarker(markerPosX, markerPosY, markerSize);
}

//Draw marker at given position and size
function drawMarker(xPos, yPos, size) {
    fill(150);
    noStroke();
    ellipse(xPos, yPos, size, size);
}

//Draw door in bottom right corner
function drawDoor() {
    //standard door width ~ 75cm - therefore needs diameter of 150
    arc(canvasSizeX - 5, canvasSizeY, 150, 150, PI, PI * (2.5 / 2), PIE);
}

//Click mouse to move to new position
function mousePressed() {
    if (mouseX <= canvasSizeX && mouseX >= 0 && mouseY >= 0 && mouseY <= canvasSizeY) {
        markerPosX = mouseX;
        markerPosY = mouseY;
    }
}

function playPauseAudio() {
    if (oscStatus === 0) {
        osc1.start();
        oscStatus = 1;
    } else if (oscStatus === 1) {
        osc1.stop();
        oscStatus = 0;
    }
}