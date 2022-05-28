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
let markerMovementInc = 2; //Xcm increments
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
let colorValuesXharm = [];
let colorValuesYharm = [];
let visX = [];
let visY = [];
let visXY;
let startingColorX = [236, 0, 255]; //purple
let startingColorY = [255, 251, 0]; //yellow

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

    //setup relating to X-direction oscillator
    oscX.amp(0);
    setOscFreq("X", currentHarmonicX);
    setFreqLabel("X", currentHarmonicX);

    //setup relating to Y-direction oscillator
    oscY.amp(0);
    setOscFreq("Y", currentHarmonicY);
    setFreqLabel("Y", currentHarmonicY);

    //setup relating to room labels
    document.getElementById("xSize").innerHTML = str(roomSizeX);
    document.getElementById("ySize").innerHTML = str(roomSizeY);
    document.getElementById("lowestMode").innerHTML = str(min(lowestFreqX, lowestFreqY));

    ampAnalyser = new p5.Amplitude();

    //compute the 6 base visualisations 
    computeVisualisations();
}

function draw() {
    //persisting elements
    noFill();
    stroke(0);

    //draw background visualisation based on current settings
    switch (visStatus) {
        case 0: //vis switch off
            background(255);
            break;
        case 1: //vis switch on
            switch (currentVisualisation) {
                case "0": //when switch is on but both osc are off
                    background(255);
                    break;
                case "1":
                    image(visX[0], 0, 0);
                    break;
                case "2":
                    image(visX[1], 0, 0);
                    break;
                case "3":
                    image(visX[2], 0, 0);
                    break;
                case "4":
                    image(visY[0], 0, 0);
                    break;
                case "5":
                    image(visY[1], 0, 0);
                    break;
                case "6":
                    image(visY[2], 0, 0);
                    break;
                case "XY":
                    image(visXY, 0, 0);
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

    //change marker location on keyPressed status - allows for press and hold over using keyPressed()
    if (keyIsPressed) {
        //Use WASD keys to move marker around in increments
        if (keyCode === 65 || keyCode === 68 || keyCode === 87 || keyCode === 83) {
            // determine where marker can go based on current position - is the next increment going to take outside of walls?
            if (markerPosX - markerMovementInc <= 0) { markerPermitMovement[0] = 0; } //can't go left
            if (markerPosX + markerMovementInc >= canvasSizeX) { markerPermitMovement[1] = 0; } //can't go right
            if (markerPosY - markerMovementInc <= 0) { markerPermitMovement[2] = 0; } //can't go up
            if (markerPosY + markerMovementInc >= canvasSizeY) { markerPermitMovement[3] = 0; } //can't go down

            //change marker position based on permitted movements
            if (keyCode === 68 && markerPermitMovement[1]) { // eg if left arrow pressed and marker can go left -> go left
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

    // calculate new amplitude based on marker position
    ampX = cos(radians(markerPosX / canvasSizeX * currentHarmonicX / 2 * 360));
    ampY = cos(radians(markerPosY / canvasSizeY * currentHarmonicY / 2 * 360));
    oscX.amp(ampX, 0.05);
    oscY.amp(ampY, 0.05);

    // print sound level at 30fps
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

//toggle between playing and pause state for audio playback for X-direction
function playPauseAudioX() {
    if (oscStatusX === 0) { //if oscX is off, turn on, trigger selection of harmonic
        oscX.start();
        oscStatusX = 1;
        selectHarmonicX(); //select active osc harmonic (x)
    } else if (oscStatusX === 1) { //if oscX is on, turn off
        oscX.stop();
        oscStatusX = 0;
        selectHarmonicY(); //select inactive osc harmonic (y) to ensure the toggle actually "turns off" if the other is still on
    }
}

//toggle between playing and pause state for audio playback for Y-direction
function playPauseAudioY() {
    if (oscStatusY === 0) { //if oscY is off, turn on, trigger selection of harmonic
        oscY.start();
        oscStatusY = 1;
        selectHarmonicY(); //select active osc harmonic (y)
    } else if (oscStatusY === 1) { //if oscY is on, turn off
        oscY.stop();
        oscStatusY = 0;
        selectHarmonicX(); //select inactive osc harmonic (x) to ensure the toggle actually "turns off" if the other is still on
    }
}

//Change current harmonic for X-direction
function selectHarmonicX() {
    //get radio group element
    var harmonicsX = document.getElementsByName("harmonicSelectRadioX");

    //find active element within radio group
    for (var i = 0; i < harmonicsX.length; i++) {
        if (harmonicsX[i].checked) {
            currentHarmonicX = harmonicsX[i].value; //set harmonic based on checked value
            setCurrentVisualisation(); //set visualisation based on checked value
        }
    }

    //set contents of labels
    setFreqLabel("X", currentHarmonicX * harmonicMultiplier);
    setOscFreq("X", currentHarmonicX * harmonicMultiplier);
}

//Change current harmonic for Y-direction
function selectHarmonicY() {
    //get radio group element
    var harmonicsY = document.getElementsByName("harmonicSelectRadioY");

    //find active element within radio group
    for (var i = 0; i < harmonicsY.length; i++) {
        if (harmonicsY[i].checked) {
            currentHarmonicY = harmonicsY[i].value;//set harmonic based on checked value
            setCurrentVisualisation(); //set visualisation based on checked value
        }
    }

    //set contents of labels
    setFreqLabel("Y", currentHarmonicY * harmonicMultiplier);
    setOscFreq("Y", currentHarmonicY * harmonicMultiplier);
}

//set frequency of oscillator - calculated from lowest freq and current harmonic, flag for X or Y
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

//set contents of frequency labe - calculated from lowest freq and current harmonic, flag for X or Y
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

//calculate frequency of first standing wave for given distance
function calculateLowestRoomModeFreq(dimension) {
    var c = 343;
    var mode = 1;
    var freq = c / ((2 * dimension) / mode);

    return freq;

}

//reset state of all UI elements
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

//calculate 6 visualisations for harmonic 1-3, x and y directions
function computeVisualisations() {
    //uses same maths as amplitude calculation

    //calculate color values for harmonics 1-3, x direction. creates [3x681]
    for (var j = 0; j < 3; j++) {
        colorValuesXharm[j] = [];
        for (var i = 0; i <= canvasSizeX; i++) {
            colorValuesXharm[j][i] = abs(cos(radians(i / canvasSizeX * (j + 1) / 2 * 360)));
        }
    }

    //create images for x harm 1-3. creates [3x381x681]
    for (var i = 0; i < 3; i++) {
        visX[i] = createImage(canvasSizeX, canvasSizeY);
        visX[i].loadPixels();
        let x, y, currentValue;
        // fill with color as defined by initial vector of color values
        for (y = 0; y < canvasSizeY; y++) {
            for (x = 0; x < canvasSizeX; x++) {
                currentValue = colorValuesXharm[i][x];
                writeColor(visX[i], x, y, round(currentValue * startingColorX[0]), round(currentValue * startingColorX[1]), round(currentValue * startingColorX[2]), 255);
            }
        }
        visX[i].updatePixels();
    }

    //calculate color values for harmonics 1-3, y direction. creates [3x381]
    for (var j = 0; j < 3; j++) {
        colorValuesYharm[j] = [];
        for (var i = 0; i <= canvasSizeY; i++) {
            colorValuesYharm[j][i] = abs(cos(radians(i / canvasSizeY * (j + 1) / 2 * 360)));
        }
    }

    //create image for y harm 1-3, created [3x381x681]
    for (var i = 0; i < 3; i++) {
        visY[i] = createImage(canvasSizeX, canvasSizeY);
        visY[i].loadPixels();
        // fill with color as defined by initial vector of color values
        for (y = 0; y < canvasSizeY; y++) {
            for (x = 0; x < canvasSizeX; x++) {
                currentValue = colorValuesYharm[i][y];
                writeColor(visY[i], x, y, round(currentValue * startingColorY[0]), round(currentValue * startingColorY[1]), round(currentValue * startingColorY[2]), 255);
            }
        }
        visY[i].updatePixels();
    }

    // create empty image for building combination visualisation in later
    visXY = createImage(canvasSizeX, canvasSizeY);
}

//helper function for writing color value to array
function writeColor(image, x, y, red, green, blue, alpha) {
    let index = (x + y * width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
    image.pixels[index + 3] = alpha;
}

//compute combination of current X and current Y visualisation
function computeCurrentXYVisualisation() {
    var xImage, yImage;

    visXY = createImage(canvasSizeX, canvasSizeY); // requires creating new image each time to avoid infinite blending

    // based on currentHarmonicX and currentHarmonicY, get the two images and BLEND THEM
    switch (currentHarmonicX) {
        case "1":
            xImage = visX[0];
            break;
        case "2":
            xImage = visX[1];
            break;
        case "3":
            xImage = visX[2];
            break;
    }

    switch (currentHarmonicY) {
        case "1":
            yImage = visY[0];
            break;
        case "2":
            yImage = visY[1];
            break;
        case "3":
            yImage = visY[2];
            break;
    }

    visXY.blend(xImage, 0, 0, canvasSizeX, canvasSizeY, 0, 0, canvasSizeX, canvasSizeY, DIFFERENCE);
    visXY.blend(yImage, 0, 0, canvasSizeX, canvasSizeY, 0, 0, canvasSizeX, canvasSizeY, DIFFERENCE);
}

//set which vis to draw based on selected harmonics
function setCurrentVisualisation() {
    //vis only changes when selecting harmonic for active osc
    if (!oscStatusX & !oscStatusY) { //if neither osc, use 0
        currentVisualisation = str(0);
    } else if (oscStatusX & !oscStatusY) {
        currentVisualisation = str(currentHarmonicX); //if only oscX, use 1-3
    } else if (!oscStatusX & oscStatusY) {
        currentVisualisation = str(int(currentHarmonicY) + 3); //if only oscY, use 4-6
    } else if (oscStatusX & oscStatusY) { //if both, use "XY" and recompute
        currentVisualisation = "XY";
        computeCurrentXYVisualisation();
    }
}

//toggle status for visualisation on / off
function toggleVisualisation() {
    if (visStatus == 0) { //turn on visualisation
        visStatus = 1;
    } else if (visStatus == 1) { //turn off visualisation
        visStatus = 0;
    }
    //document.getElementById("toggleVisualisation").checked
}