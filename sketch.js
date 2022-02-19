/*
Standing waves demo

Author: Kat Young
https://github.com/tibbakoi
2022
*/

//size variables - using 1px = 1cm
// for reference, gen6 teaching room is 7m x 5.6m x 2.6m
let roomSizeX = 700; // 7m wide
let roomSizeY = 460; //4.6m deep
let markerSize = 15; //person head ~15cm wide?

let canvasSizeX = roomSizeX;
let canvasSizeY = roomSizeY + 75; //extra room at the bottom for buttons etc

// movement variables
let markerMovementInc = 5; //5cm increments
let markerPermitMovement = [1, 1, 1, 1]; //Left right up down

// starting position variables - bottom right
let markerPosX = roomSizeX - 50;
let markerPosY = roomSizeY - 10;

// audio variables
let oscX = new p5.Oscillator('sine');
let playButton, harmonicSelectRadio;

//default values
let oscStatus = 0;
let currentHarmonic = 1;
let lowestFreq = 100;

function setup() {
    let canvas = createCanvas(canvasSizeX, canvasSizeY);
    canvas.parent('demo');
    frameRate(60);

    oscX.amp(0);
    oscX.freq(lowestFreq * currentHarmonic);

    playButton = createButton('toggle play').position(10, roomSizeY + 125);
    playButton.mousePressed(playPauseAudio);
    playButton.parent('demo');

    harmonicSelectRadio = createRadio().position(10, roomSizeY + 150);
    harmonicSelectRadio.option('1');
    harmonicSelectRadio.option('2');
    harmonicSelectRadio.option('3');
    harmonicSelectRadio.selected(str(currentHarmonic));

}

function draw() {
    //persisting elements
    background(255);
    noFill();
    stroke(0);
    rect(0, 0, canvasSizeX, canvasSizeY);
    rect(0, 0, roomSizeX, roomSizeY);
    drawDoor();

    //changing elements

    //changing marker location on keyPressed status rather than keyPressed function allows for press and hold
    if (keyIsPressed) {
        //Use WASD keys to move marker around in increments
        if (keyCode === 65 || keyCode === 68 || keyCode === 87 || keyCode === 83) {
            // determine where marker can go based on current position - is the next increment going to take outside of walls?
            if (markerPosX - markerMovementInc <= 0) { markerPermitMovement[0] = 0; } //can't go left
            if (markerPosX + markerMovementInc >= roomSizeX) { markerPermitMovement[1] = 0; } //can't go right
            if (markerPosY - markerMovementInc <= 0) { markerPermitMovement[2] = 0; } //can't go up
            if (markerPosY + markerMovementInc >= roomSizeY) { markerPermitMovement[3] = 0; } //can't go down

            //change marker position based on permitted movements
            if (keyCode === 68 && markerPermitMovement[1]) {
                markerPosX = markerPosX + markerMovementInc;
            } else if (keyCode === 65 && markerPermitMovement[0]) {
                markerPosX = markerPosX - markerMovementInc;
            } else if (keyCode === 87 && markerPermitMovement[2]) {
                markerPosY = markerPosY - markerMovementInc;
            } else if (keyCode === 83 && markerPermitMovement[3]) {
                markerPosY = markerPosY + markerMovementInc;
            }

            // reset permitted movements for next key press
            markerPermitMovement = [1, 1, 1, 1];
        }
    }

    //draw marker location
    drawMarker(markerPosX, markerPosY, markerSize);

    //change amplitude accordingly based on markerPosX, ramping over 0.05seconds
    oscX.amp(cos(radians(markerPosX / canvasSizeX * currentHarmonic / 2 * 360)), 0.05);

    harmonicSelectRadio.changed(selectHarmonic);
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
    arc(roomSizeX - 5, roomSizeY, 150, 150, PI, PI * (2.5 / 2), PIE);
}

//Click mouse to move to new position
function mousePressed() {
    if (mouseX <= roomSizeX && mouseX >= 0 && mouseY >= 0 && mouseY <= roomSizeY) {
        markerPosX = mouseX;
        markerPosY = mouseY;
    }
}

//Button for audio playback
function playPauseAudio() {
    if (oscStatus === 0) {
        oscX.start();
        oscStatus = 1;
    } else if (oscStatus === 1) {
        oscX.stop();
        oscStatus = 0;
    }
}

//Change current harmonic
function selectHarmonic() {
    currentHarmonic = int(harmonicSelectRadio.value());
    oscX.freq(lowestFreq * currentHarmonic);

}