/*
Standing waves demo

Author: Kat Young
https://github.com/tibbakoi
2022
*/

//size variables - using 1px = 1cm
// for reference, gen6 teaching room is 7m x 5.6m x 2.6m
let roomSizeX = 700; // 7m wide
let roomSizeY = 400; //4.6m deep
let markerSize = 15; //person head ~15cm wide?

let canvasSizeX, canvasSizeY; //decouple drawing from maths

// movement variables
let markerMovementInc = 5; //5cm increments
let markerPermitMovement = [1, 1, 1, 1]; //Left right up down

// starting position variables - bottom right
let markerPosX = roomSizeX - 50;
let markerPosY = roomSizeY - 10;

// audio variables
let oscX = new p5.Oscillator('sine');
let oscY = new p5.Oscillator('sine');
let playButtonX, harmonicSelectRadioX, playButtonY, harmonicSelectRadioY;

//default values
let oscStatusX = 0;
let currentHarmonicX = 1;
let lowestFreqX = 175;

let oscStatusY = 0;
let currentHarmonicY = 1;
let lowestFreqY = 100;

let textcolourX, textcolourY;

let currentWidth, currentHeight;

function setup() {
    //get dims of current div
    currentWidth = document.getElementById('demo').clientWidth;
    currentHeight = document.getElementById('demo').clientHeight;

    roomSizeX = currentWidth;
    roomSizeY = currentHeight;

    let canvas = createCanvas(roomSizeX, roomSizeY);
    canvas.parent('demo');
    frameRate(60);

    //relating to X-direction generation
    oscX.amp(0);
    oscX.freq(lowestFreqX * currentHarmonicX);

    //relating to Y-direction generation
    oscY.amp(0);
    oscY.freq(lowestFreqY * currentHarmonicY);

    document.getElementById("xDirection").innerHTML = str(lowestFreqX * currentHarmonicX) + "Hz";
    document.getElementById("yDirection").innerHTML = str(lowestFreqY * currentHarmonicY) + "Hz";
    document.getElementById("xSize").innerHTML = str(roomSizeX / 100);
    document.getElementById("ySize").innerHTML = str(roomSizeY / 100);

}

function draw() {
    //persisting elements
    background(255);
    noFill();
    stroke(0);
    //draw walls
    rect(0, 0, roomSizeX, roomSizeY);
    //draw door - standard door width ~ 75cm - therefore needs diameter of 150
    arc(roomSizeX - 5, roomSizeY, 150, 150, PI, PI * (2.5 / 2), PIE);
    //10px cross for centre
    line(roomSizeX / 2 + 5, roomSizeY / 2, roomSizeX / 2 - 5, roomSizeY / 2);
    line(roomSizeX / 2, roomSizeY / 2 - 5, roomSizeX / 2, roomSizeY / 2 + 5);


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

    //change amplitude accordingly based on markerPosX and markerPosY, ramping over 0.05seconds
    oscX.amp(cos(radians(markerPosX / roomSizeX * currentHarmonicX / 2 * 360)), 0.05);
    oscY.amp(cos(radians(markerPosY / roomSizeY * currentHarmonicY / 2 * 360)), 0.05);

}

//Draw marker at given position and size
function drawMarker(xPos, yPos, size) {
    fill(150);
    noStroke();
    ellipse(xPos, yPos, size, size);
}

//Click mouse to move to new position
function mousePressed() {
    if (mouseX <= roomSizeX && mouseX >= 0 && mouseY >= 0 && mouseY <= roomSizeY) {
        markerPosX = mouseX;
        markerPosY = mouseY;
    }
}

//Button for audio playback for X-direction
function playPauseAudioX() {
    if (oscStatusX === 0) {
        oscX.start();
        oscStatusX = 1;
        document.getElementById("xDirection").style.color = color(0, 255, 0);;
    } else if (oscStatusX === 1) {
        oscX.stop();
        oscStatusX = 0;
        document.getElementById("xDirection").style.color = color(0, 0, 0);;
    }
}

//Button for audio playback for Y-direction
function playPauseAudioY() {
    if (oscStatusY === 0) {
        oscY.start();
        oscStatusY = 1;
        document.getElementById("yDirection").style.color = color(0, 255, 0);;

    } else if (oscStatusY === 1) {
        oscY.stop();
        oscStatusY = 0;
        document.getElementById("yDirection").style.color = color(0, 0, 0);;

    }
}

//Change current harmonic for X-direction
function selectHarmonicX() {
    var harmonicsX = document.getElementsByName("harmonicSelectRadioX");

    for(var i = 0; i < harmonicsX.length; i++) {
        if(harmonicsX[i].checked)
        currentHarmonicX = harmonicsX[i].value;
    }

    document.getElementById("xDirection").innerHTML = str(lowestFreqX * currentHarmonicX) + "Hz";

    oscX.freq(lowestFreqX * currentHarmonicX);
}

//Change current harmonic for Y-direction
function selectHarmonicY() {
    var harmonicsY = document.getElementsByName("harmonicSelectRadioY");

    for(var i = 0; i < harmonicsY.length; i++) {
        if(harmonicsY[i].checked)
        currentHarmonicY = harmonicsY[i].value;
    }

    //currentHarmonicY = int(harmonicSelectRadioY.value());
    document.getElementById("yDirection").innerHTML = str(lowestFreqY * currentHarmonicY) + "Hz";
    oscY.freq(lowestFreqY * currentHarmonicY);
}

function windowResized() {
    currentWidth = document.getElementById('demo').clientWidth;
    currentHeight = document.getElementById('demo').clientHeight;

    document.getElementById("extra").innerHTML = str(currentHeight);
    roomSizeX = currentWidth;
    roomSizeY = currentHeight;

    document.getElementById("xSize").innerHTML = str(roomSizeX / 100);
    document.getElementById("ySize").innerHTML = str(roomSizeY / 100);

    resizeCanvas(roomSizeX, roomSizeY);
  }