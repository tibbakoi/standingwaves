/*
Standing waves demo

Author: Kat Young
https://github.com/tibbakoi
2022
*/

//size variables
// for reference, gen6 teaching room is 7m x 5.6m x 2.6m
let roomSizeX = 3.8;
let roomSizeY = 2.4;

//decouple drawing maths from physics maths
let canvasSizeX = 650;
let canvasSizeY = 380;
let markerSize = 15; //person head ~15cm wide?

// movement variables
let markerMovementInc = 2; //3cm increments
let markerPermitMovement = [1, 1, 1, 1]; //Left right up down

// starting position
let markerPosXDefault = 50;
let markerPosYDefault = 25;
let markerPosX = markerPosXDefault;
let markerPosY = markerPosYDefault;

// audio variables
let oscX = new p5.Oscillator('sine');
let oscY = new p5.Oscillator('sine');
let ampAnalyser;
let playButtonX, harmonicSelectRadioX, playButtonY, harmonicSelectRadioY, resetButton;
let ampX, ampY;

// image variables for visualisation
let visStatus = 0;
let currentVisualisation = 0;
let colValueX = [];
let colValueY = [];
let visXharm1, visXharm2, visXharm3, visYharm1, visYharm2, visYharm3;

//default values
let oscStatusX = 0;
let currentHarmonicX = 1;
let lowestFreqX;

let oscStatusY = 0;
let currentHarmonicY = 1;
let lowestFreqY;

let harmonicMultiplier = 1;

function setup() {

    let canvas = createCanvas(canvasSizeX, canvasSizeY);
    canvas.parent('demo');
    frameRate(60);

    //calculate lowest room modes in X and Y directions based on room size
    lowestFreqX = round(calculateLowestRoomModeFreq(roomSizeX), 2);
    lowestFreqY = round(calculateLowestRoomModeFreq(roomSizeY), 2);

    //relating to X-direction generation
    oscX.amp(0);
    setOscFreq("X", currentHarmonicX);
    setFreqLabel("X", currentHarmonicX);

    //relating to Y-direction generation
    oscY.amp(0);
    setOscFreq("Y", currentHarmonicY);
    setFreqLabel("Y", currentHarmonicY);

    document.getElementById("xSize").innerHTML = str(roomSizeX);
    document.getElementById("ySize").innerHTML = str(roomSizeY);

    document.getElementById("lowestMode").innerHTML = str(min(lowestFreqX, lowestFreqY));

    ampAnalyser = new p5.Amplitude();

    disableVisualisationToggle();

    computeVisualisations();
}



function draw() {
    //persisting elements
    noFill();
    stroke(0);

    //draw background visualisation based on current settings
    switch (visStatus) {
        case 0:
            background(255);
            break;
        case 1:
            switch (currentVisualisation) {
                case "1":
                    image(visXharm1, 0, 0);
                    break;
                case "2":
                    image(visXharm2, 0, 0);
                    break;
                case "3":
                    image(visXharm3, 0, 0);
                    break;
            }
    }

    //draw walls
    rect(0, 0, canvasSizeX, canvasSizeY);
    //draw door - standard door width ~ 75cm - therefore needs diameter of 150
    arc(5, 0, 150, 150, 0, PI * 0.3, PIE);
    //10px cross for centre
    line(canvasSizeX / 2 + 5, canvasSizeY / 2, canvasSizeX / 2 - 5, canvasSizeY / 2);
    line(canvasSizeX / 2, canvasSizeY / 2 - 5, canvasSizeX / 2, canvasSizeY / 2 + 5);

    //changing marker location on keyPressed status rather than keyPressed function allows for press and hold
    if (keyIsPressed) {
        //Use WASD keys to move marker around in increments
        if (keyCode === 65 || keyCode === 68 || keyCode === 87 || keyCode === 83) {
            // determine where marker can go based on current position - is the next increment going to take outside of walls?
            if (markerPosX - markerMovementInc <= 0) { markerPermitMovement[0] = 0; } //can't go left
            if (markerPosX + markerMovementInc >= canvasSizeX) { markerPermitMovement[1] = 0; } //can't go right
            if (markerPosY - markerMovementInc <= 0) { markerPermitMovement[2] = 0; } //can't go up
            if (markerPosY + markerMovementInc >= canvasSizeY) { markerPermitMovement[3] = 0; } //can't go down

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

    // calculate new amplitude based on position
    ampX = cos(radians(markerPosX / canvasSizeX * currentHarmonicX / 2 * 360));
    ampY = cos(radians(markerPosY / canvasSizeY * currentHarmonicY / 2 * 360));
    oscX.amp(ampX, 0.05);
    oscY.amp(ampY, 0.05);

    if (frameCount % 2 == true) {
        document.getElementById("soundLevel").innerHTML = str(round(ampAnalyser.getLevel(), 2));
    }

}

//Draw marker at given position and size
function drawMarker(xPos, yPos, size) {
    fill(4, 170, 109);
    noStroke();
    ellipse(xPos, yPos, size, size);
}

//Click mouse to move to new position
function mousePressed() {
    if (mouseX <= canvasSizeX && mouseX >= 0 && mouseY >= 0 && mouseY <= canvasSizeY) {
        markerPosX = mouseX;
        markerPosY = mouseY;
    }
}

//Button for audio playback for X-direction
function playPauseAudioX() {
    if (oscStatusX === 0) {
        oscX.start();
        oscStatusX = 1;
        enableVisualisationToggle();
    } else if (oscStatusX === 1) {
        oscX.stop();
        oscStatusX = 0;
        if (visStatus) { //is vis is currently on, turn it off too
            document.getElementById("toggleVisualisation").click();
        }
        disableVisualisationToggle();

    }
}

//Button for audio playback for Y-direction
function playPauseAudioY() {
    if (oscStatusY === 0) {
        oscY.start();
        oscStatusY = 1;
        enableVisualisationToggle();
    } else if (oscStatusY === 1) {
        oscY.stop();
        oscStatusY = 0;
        disableVisualisationToggle();
    }
}

//Change current harmonic for X-direction
function selectHarmonicX() {
    var harmonicsX = document.getElementsByName("harmonicSelectRadioX");

    for (var i = 0; i < harmonicsX.length; i++) {
        if (harmonicsX[i].checked)
            currentHarmonicX = harmonicsX[i].value;
    }

    setFreqLabel("X", currentHarmonicX * harmonicMultiplier);
    setOscFreq("X", currentHarmonicX * harmonicMultiplier);

    if (visStatus) {
        currentVisualisation = currentHarmonicX;
    }

    setCurrentVisualisation();

}

//Change current harmonic for Y-direction
function selectHarmonicY() {
    var harmonicsY = document.getElementsByName("harmonicSelectRadioY");

    for (var i = 0; i < harmonicsY.length; i++) {
        if (harmonicsY[i].checked)
            currentHarmonicY = harmonicsY[i].value;
    }

    setFreqLabel("Y", currentHarmonicY * harmonicMultiplier);
    setOscFreq("Y", currentHarmonicY * harmonicMultiplier);

}

function setOscFreq(oscIndicator, harmonic) {
    switch (oscIndicator) {
        case "X":
            oscX.freq(lowestFreqX * harmonic);
            break;
        case "Y":
            oscY.freq(lowestFreqY * harmonic);
            break;
    }
}

function setFreqLabel(labelIndicator, harmonic) {
    switch (labelIndicator) {
        case "X":
            document.getElementById("xDirection").innerHTML = str(round(lowestFreqX * harmonic, 2)) + "Hz";
            break;
        case "Y":
            document.getElementById("yDirection").innerHTML = str(round(lowestFreqY * harmonic, 2)) + "Hz";
            break;
    }
}

function calculateLowestRoomModeFreq(dimension) {
    var c = 343;
    var mode = 1;
    var freq = c / ((2 * dimension) / mode);

    return freq;

}

function resetAll() {

    //reset X
    currentHarmonicX = 1;
    setFreqLabel("X", currentHarmonicX);
    setOscFreq("X", currentHarmonicX);
    document.getElementById("harmonicX_1").checked = true;

    if (oscStatusX == 1) {
        document.getElementById("toggleAudioX").click();
    }

    //reset Y
    currentHarmonicY = 1;
    setFreqLabel("Y", currentHarmonicY);
    setOscFreq("Y", currentHarmonicY);
    document.getElementById("harmonicY_1").checked = true;

    if (oscStatusY == 1) {
        document.getElementById("toggleAudioY").click();
    }

    //reset marker
    markerPosX = markerPosXDefault;
    markerPosY = markerPosYDefault;

    //reset multiply if relevant
    if (harmonicMultiplier == 3) {
        document.getElementById("toggleHarmonicMultiplier").click();
    }

    //reset visualisation if relevant
    if (visStatus == 1) {
        document.getElementById("toggleVisualisation").click();
    }

}

// multiply harmonics by 3 (i.e. make room 3x smaller) for audibility
function multiplyHarmonics() {
    if (harmonicMultiplier == 1) {
        harmonicMultiplier = 3;
    } else {
        harmonicMultiplier = 1;
    }

    setFreqLabel("X", currentHarmonicX * harmonicMultiplier);
    setOscFreq("X", currentHarmonicX * harmonicMultiplier);

    setFreqLabel("Y", currentHarmonicY * harmonicMultiplier);
    setOscFreq("Y", currentHarmonicY * harmonicMultiplier);
}

//calculate visualisation for harmonic 1, x direction
function computeVisualisations() {

    //calculate colour values for harmonic 1-3, x direction. creates [3x681]
    for (var j = 0; j < 3; j++) {
        colValueX[j] = [];
        for (var i = 0; i <= canvasSizeX; i++) {
            colValueX[j][i] = abs(cos(radians(i / canvasSizeX * (j + 1) / 2 * 360)));
        }
    }

    //calculate colour values for harmonic 1-3, y direction. creates [3x381]
    for (var j = 0; j < 3; j++) {
        colValueY[j] = [];
        for (var i = 0; i <= canvasSizeY; i++) {
            colValueY[j][i] = abs(cos(radians(i / canvasSizeY * (j + 1) / 2 * 360)));
        }
    }

    //create image for x harm 1
    visXharm1 = createImage(canvasSizeX, canvasSizeY);
    visXharm1.loadPixels();
    let x, y, currentValue;
    // fill with color
    for (y = 0; y < visXharm1.height; y++) {
        for (x = 0; x < visXharm1.width; x++) {
            currentValue = round(colValueX[0][x] * 255);
            writeColor(visXharm1, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visXharm1.updatePixels();

    //create image for x harm 2
    visXharm2 = createImage(canvasSizeX, canvasSizeY);
    visXharm2.loadPixels();
    // fill with color
    for (y = 0; y < visXharm2.height; y++) {
        for (x = 0; x < visXharm2.width; x++) {
            currentValue = round(colValueX[1][x] * 255);
            writeColor(visXharm2, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visXharm2.updatePixels();

    //create image for x harm 3
    visXharm3 = createImage(canvasSizeX, canvasSizeY);
    visXharm3.loadPixels();
    // fill with color
    for (y = 0; y < visXharm3.height; y++) {
        for (x = 0; x < visXharm3.width; x++) {
            currentValue = round(colValueX[2][x] * 255);
            writeColor(visXharm3, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visXharm3.updatePixels();

    //create image for Y harm 1
    visYharm1 = createImage(canvasSizeX, canvasSizeY);
    visYharm1.loadPixels();
    // fill with color
    for (y = 0; y < visYharm1.height; y++) {
        for (x = 0; x < visYharm1.width; x++) {
            currentValue = round(colValueY[0][y] * 255);
            writeColor(visYharm1, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visYharm1.updatePixels();

    //create image for Y harm 2
    visYharm2 = createImage(canvasSizeX, canvasSizeY);
    visYharm2.loadPixels();
    // fill with color
    for (y = 0; y < visYharm2.height; y++) {
        for (x = 0; x < visYharm2.width; x++) {
            currentValue = round(colValueY[1][y] * 255);
            writeColor(visYharm2, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visYharm2.updatePixels();

    //create image for Y harm 3
    visYharm3 = createImage(canvasSizeX, canvasSizeY);
    visYharm3.loadPixels();
    // fill with color
    for (y = 0; y < visYharm3.height; y++) {
        for (x = 0; x < visYharm3.width; x++) {
            currentValue = round(colValueY[2][y] * 255);
            writeColor(visYharm3, x, y, currentValue, currentValue, currentValue, 255);
        }
    }
    visYharm3.updatePixels();

}

// helper function for writing colour value to array
function writeColor(image, x, y, red, green, blue, alpha) {
    let index = (x + y * width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
    image.pixels[index + 3] = alpha;
}

function setCurrentVisualisation() {
    currentVisualisation = currentHarmonicX;
}

function toggleVisualisation() {
    if (visStatus == 0) { //turn on visualisation
        visStatus = 1;
    } else if (visStatus == 1) { //turn off visualisation
        visStatus = 0;
    }
}

function disableVisualisationToggle() {
    document.getElementById("toggleVisualisation").disabled = true;
}

function enableVisualisationToggle() {
    document.getElementById("toggleVisualisation").disabled = false;
}