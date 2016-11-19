/*var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);*/

/* ^^^^^^^^^^^^^^^^^^^^^ BEGIN PROGRAM CODE ^^^^^^^^^^^^^^^^^^^^^ \*/

angleMode = 'radians';
var KEYS = [];
textAlign(CENTER, CENTER);

var GameState = {
    START_MENU : 0,
    PLAYING : 1,
    HELP_MENU : 2,
    OPTIONS_MENU : 3,
    CONTROLS_MENU : 4,
	PAUSED : 5,
};
var CurrentGameState = GameState.START_MENU;
var SETTINGS_PLAYER_COLOR = 0;

/* --------------------- Button Object --------------------- \*/

var Button = function(x, y, txt) {
    this.position = new PVector(x, y); // Center of the button
    this.text = txt;
    
    this.width = 80;
    this.height = 30;
};

Button.prototype.mouseIsOnMe = function() {
    return (mouseX > this.getCornerPositionX('upper_left') && mouseX < this.getCornerPositionX('upper_right')) && (mouseY > this.getCornerPositionY('upper_left') && mouseY < this.getCornerPositionY('lower_right'));
};

/* Expects a string parameter of either 'upper_left', 'upper_right', 'lower_left', 'lower_right' */
Button.prototype.getCornerPositionX = function(corner) {
    switch(corner) 
    {
        case "upper_left":
            return this.position.x - this.width/2;
        case "upper_right":
            return this.position.x + this.width/2;
        case "lower_left":
            return this.position.x - this.width/2;
        case "lower_right":
            return this.position.x + this.width/2;
        default:
            return 0; // Error Case
    }
};

/* Expects a string parameter of either 'upper_left', 'upper_right', 'lower_left', 'lower_right' */
Button.prototype.getCornerPositionY = function(corner) {
    switch(corner) 
    {
        case "upper_left":
            return this.position.y - this.height/2;
        case "upper_right":
            return this.position.y - this.height/2;
        case "lower_left":
            return this.position.y + this.height/2;
        case "lower_right":
            return this.position.y + this.height/2;
        default:
            return 0; // Error Case
    }
};

Button.prototype.getVertices = function() {
    return [{x:this.getCornerPositionX("upper_left") , y:this.getCornerPositionY("upper_left") },
{x:this.getCornerPositionX("upper_right"), y:this.getCornerPositionY("upper_right")},
{x:this.getCornerPositionX("lower_right"), y:this.getCornerPositionY("lower_right")},
{x:this.getCornerPositionX("lower_left") , y:this.getCornerPositionY("lower_left") }];
};

Button.prototype.draw = function() {
    if (this.mouseIsOnMe()) {
        fill(200, 200, 200);
        cursor(HAND);
    }
    else {
        noFill();
    }

    var vertices = this.getVertices();
    beginShape();
        for (var i = 0; i < vertices.length;i++) {
            vertex(vertices[i].x, vertices[i].y);
        }
    endShape(CLOSE);
    
    fill(0);
    textSize(16);
    text(this.text, this.position.x, this.position.y);
};

/* --------------------- END Button Object --------------------- \*/

var ArrowButton = function(x, y, txt, dir) {
    Button.apply(this, arguments);
    
    this.width = 50;
    this.height = 25;
    
    this.direction = ((dir || 1) > 0) ? 1 : -1;
};

ArrowButton.prototype = Object.create(Button.prototype);
ArrowButton.prototype.constructor = ArrowButton;

ArrowButton.prototype.getVertices = function() {
    var stemSize_h = 0.6;
    var stemSize_w = 0.6;
    
    var x1 = -(this.width/2);
    var x2 = (stemSize_w * this.width) - (this.width/2);
    var x3 = (this.width/2);
    
    var y1 = -1*((stemSize_h * this.height)/2);
    var y2 = -1*(this.height/2);
    var y3 = 0;
    
        return [{x:this.position.x+(this.direction*x1), y:this.position.y-y1},
                {x:this.position.x+(this.direction*x2), y:this.position.y-y1},
                {x:this.position.x+(this.direction*x2), y:this.position.y-y2},
                {x:this.position.x+(this.direction*x3), y:this.position.y-y3}, // ArrowHead
                {x:this.position.x+(this.direction*x2), y:this.position.y+y2},
                {x:this.position.x+(this.direction*x2), y:this.position.y+y1},
                {x:this.position.x+(this.direction*x1), y:this.position.y+y1}];

};

/* --------------------- Menu Views --------------------- \*/
var playButton = new Button(200, 200, "Play");
var helpButton = new Button(200, 250, "Help");
var optionsButton = new Button(200, 300, "Options");
var help_nextButton = new ArrowButton(350, 350, "Next");
var controls_backButton = new ArrowButton(50, 350, "Back", -1);
var menuButton = new Button(200, 350, "Menu");
var displayStartMenu = function() {
    background(255, 255, 255);
    fill(0);
    
    textSize(50);
    text("Jumping Jan", 200, 80);
    
    textSize(20);
    text("Collin C. Choy", 75, 380);
    
    playButton.draw();
    helpButton.draw();
    optionsButton.draw();
};

var displayHelpMenu = function() {
    background(255, 0, 0, 10);
    fill(0);
    textSize(30);
    text("Instructions", 200, 140);
    
    // State Constants
    var CONTENT_X1 = 50;
    var CONTENT_X2 = 350;
    var CONTENT_W = CONTENT_X2 - CONTENT_X1;
    
    var CONTENT_Y1 = 180;
    var CONTENT_Y2 = 280;
    var CONTENT_H = CONTENT_Y2 - CONTENT_Y1;
    
    // Content Box
    stroke(0);
    fill(199, 197, 197, 50);
    rect(CONTENT_X1, CONTENT_Y1, CONTENT_W, CONTENT_H);
    fill(0);
    var instructions = "Jan awakens to find herself in a strange new land. Help her get home by exploring this new world. Be weary of anyone or anything that you find as they may not be friendly!";
    textSize(14);
    text(instructions, 55, 180, 280, 95);
    
    help_nextButton.draw();
};

var drawKey = function(x, y, label, width) {
    var KEY_SIZE_W = width || 20;
    var KEY_SIZE_H = 20;
    fill(245, 245, 245);
    rect(x-KEY_SIZE_W/2, y-KEY_SIZE_H/2, KEY_SIZE_W, KEY_SIZE_H);
    
    fill(0);
    text(label, x, y);
};

var displayControlsMenu = function() {
    background(20, 200, 0, 10);
    fill(0);
    textSize(30);
    text("Controls", 200, 140);
    
    // State Constants
    var CONTENT_X1 = 50;
    var CONTENT_X2 = 350;
    var CONTENT_W = CONTENT_X2 - CONTENT_X1;
    
    var CONTENT_Y1 = 180;
    var CONTENT_Y2 = 280;
    var CONTENT_H = CONTENT_Y2 - CONTENT_Y1;
    
    // Content Box
    stroke(0);
    fill(199, 197, 197, 50);
    rect(CONTENT_X1, CONTENT_Y1, CONTENT_W, CONTENT_H);
    fill(0);
    textSize(14);

    // AWSD Movement
    drawKey(CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H), 'W');
    drawKey(CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H)+25, 'S');
    drawKey(CONTENT_X1+(0.25*CONTENT_W)-25, CONTENT_Y1+(0.3*CONTENT_H)+25, 'A');
    drawKey(CONTENT_X1+(0.25*CONTENT_W)+25, CONTENT_Y1+(0.3*CONTENT_H)+25, 'D');
    text("Move Jan", CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.8*CONTENT_H));
    
    drawKey(CONTENT_X1+(0.75*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H), 'P');
    drawKey(CONTENT_X1+(0.75*CONTENT_W)-15, CONTENT_Y1+(0.7*CONTENT_H), "Space", 50);
    textAlign(LEFT, CENTER);
    text("Pause", CONTENT_X1+(0.75*CONTENT_W)+15, CONTENT_Y1+(0.3*CONTENT_H));
    text("Action", CONTENT_X1+(0.75*CONTENT_W)+15, CONTENT_Y1+(0.7*CONTENT_H));
    
    textAlign(CENTER, CENTER);
    controls_backButton.draw();
    menuButton.draw();
};

var ColorSelectorBox = function(x, y, col) {
    this.position = new PVector(x, y);
    this.size = 10;
    
    this.selected = false;
    
    this.color = (col === 'r') ? color(185, 0, 0) :
                    (col === 'b') ? color(80, 0, 255) :
                    (col === 'g') ? color(150, 200, 20) :
                    (col === 'y') ? color(228, 232, 16) :
                    color(185, 0, 0);
};

ColorSelectorBox.prototype.setSelected = function(newValue) {
    this.selected = newValue;
};

ColorSelectorBox.prototype.mouseIsOnMe = function() {
    return (mouseX > this.position.x-this.size/2 && mouseX < this.position.x+this.size/2 && (mouseY > this.position.y-this.size/2 && mouseY < this.position.y+this.size/2));
};

ColorSelectorBox.prototype.draw = function() {
    strokeWeight( (this.selected) ? 3 : 1 );
    stroke(0);
    
    if (this.mouseIsOnMe()) {
        cursor(HAND);   
    }
    
    fill(this.color);
    rect(this.position.x-this.size/2, this.position.y-this.size/2, this.size, this.size);
    strokeWeight(1);
};

var ColorSelector = function(x, y) {
    this.position = new PVector(x, y);
    this.items = [];
    this.selectedIndex = 0;
    
    this.PADDING = 5;
    this.ITEM_SIZE = 10;
};

ColorSelector.prototype.getWidth = function() {
    return this.items.length*(this.PADDING+this.ITEM_SIZE);
};

ColorSelector.prototype.getNextItemPosition = function() {
    return {x:this.position.x+(this.PADDING + this.ITEM_SIZE/2) + this.getWidth(), y:this.position.y};
};

ColorSelector.prototype.add = function(newItem_colorCode) {
    var pos = this.getNextItemPosition();
    this.items.push(new ColorSelectorBox(pos.x, pos.y, newItem_colorCode));
};

ColorSelector.prototype.setSelectedIndex = function(itemNumber) {
    if (itemNumber < this.items.length) {
        this.items[this.selectedIndex].setSelected(false);
        this.selectedIndex = itemNumber;
        this.items[itemNumber].setSelected(true);
    }
};

ColorSelector.prototype.mouseIsOnMe = function() {
    return (mouseX > this.position.x && mouseX < this.position.x+this.getWidth() && (mouseY > this.position.y-20/2 && mouseY < this.position.y+20/2));
};

ColorSelector.prototype.draw = function() {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].draw();   
    }
};

var playerColorSelector = new ColorSelector(50+(0.35*300), 180+(0.3*100));
    playerColorSelector.add('r');
    playerColorSelector.add('b');
    playerColorSelector.add('g');
    playerColorSelector.add('y');
var optionsMouseCallback = function() {
    if (playerColorSelector.mouseIsOnMe()) {
        for (var i = 0; i < playerColorSelector.items.length; i++) {
            if (playerColorSelector.items[i].mouseIsOnMe()) {
                playerColorSelector.setSelectedIndex(i);
                SETTINGS_PLAYER_COLOR = i;
                break;
            }
        }
    }
};

var displayOptionsMenu = function() {
    background(0, 100, 200, 10);
    fill(0);
    textSize(30);
    text("Options", 200, 140);
    
    // State Constants
    var CONTENT_X1 = 50;
    var CONTENT_X2 = 350;
    var CONTENT_W = CONTENT_X2 - CONTENT_X1;
    
    var CONTENT_Y1 = 180;
    var CONTENT_Y2 = 280;
    var CONTENT_H = CONTENT_Y2 - CONTENT_Y1;
    
    // Content Box
    stroke(0);
    strokeWeight(1);
    fill(199, 197, 197, 50);
    rect(CONTENT_X1, CONTENT_Y1, CONTENT_W, CONTENT_H);
    fill(0);
    textSize(14);
    
    text("Player Color: ", CONTENT_X1+(0.2*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H));

    playerColorSelector.setSelectedIndex(SETTINGS_PLAYER_COLOR);
    
    playerColorSelector.draw();
    
    menuButton.draw();
};

/* --------------------- END Menu Views --------------------- \*/

/* --------------------- GAME Variables --------------------- \*/
var TILE_SIZE = 40;
var NUM_TILES = 400/TILE_SIZE;

/* --------------------- GAME CLASSES --------------------- \*/
/***************************************************************************
					TILEMAP CLASS
***************************************************************************/
var Tilemap = function(tm) {
	this.TM = tm;
	this.walls = [];
	
	this.size = TILE_SIZE;
	
	// Initialize Walls list
	for (var row = 0; row < this.TM.length; row++) {
        for (var col = 0; col < this.TM[row].length; col++) {
            switch(this.TM[row][col]) {
                case 'w':
                    this.walls.push({x:col*this.size, y:row*this.size});
                    break;
                default:
                    // Do nothing
            }
        }
    }
};

Tilemap.prototype.drawWall = function(x, y) {
    image(getImage("cute/WallBlockTall"), x, y, this.size, this.size);
};

Tilemap.prototype.draw = function(){
    /*for (var row = 0; row < this.TM.length; row++) {
        for (var col = 0; col < this.TM[row].length; col++) {
            switch(this.TM[row][col]) {
                case 'w':
                    this.drawWall(col*this.size, row*this.size);
                    break;
                default:
                    // Do nothing
            }
        }
    }*/
    for (var i = 0; i < this.walls.length; i++) {
        this.drawWall(this.walls[i].x, this.walls[i].y);
    }
};

Tilemap.prototype.getTileTypeAtTile = function(tile) {
	return this.TM[tile.row][tile.col];
};

Tilemap.prototype.tileIsFree = function(tile) {
	// Check tile is in bounds
	if (tile.row <= 0 || tile.col <= 0 || tile.row >= NUM_TILES || tile.col >= NUM_TILES) {
		return false;
	}
	
	return this.getTileTypeAtTile(tile) === ' ';
};

Tilemap.prototype.getAdjacentTiles = function(tile) {
	var adjacentTiles = [];
	
	var north = {'row':tile.row-1, 'col':tile.col};
	var east = {'row':tile.row, 'col':tile.col+1};
	var south = {'row':tile.row+1, 'col':tile.col};
	var west = {'row':tile.row, 'col':tile.col-1};
	
	if (this.tileIsFree(north)) {
		adjacentTiles.push(north);
	}
	
	if (this.tileIsFree(east)) {
		adjacentTiles.push(east);
	}
	
	if (this.tileIsFree(south)) {
		adjacentTiles.push(south);
	}
	
	if (this.tileIsFree(west)) {
		adjacentTiles.push(west);
	}
	
	return adjacentTiles;
};

// Param: Coord - {x: _, y: _}
// Return: tile - {row: _, col: _}
Tilemap.getTileFromCoordinate = function(coordinate) {
    //return {'row': Math.floor(Coord.y/this.size), 'col': Math.floor(Coord.x/this.size)};
    return {'row': Math.floor(coordinate.y/TILE_SIZE), 'col': Math.floor(coordinate.x/TILE_SIZE)};
};

// Param: tile - {row: _, col: _}
// Param: position - 0 = CENTER, 1 = TOP-LEFT-CORNER
// Return: Coord - {x: _, y: _} Note: returns the CENTER-Coord of the tile by default
Tilemap.getCoordinateFromTile = function(tile, position) {
    //return {'x': tile.col*this.size+(this.size/2), 'y': tile.row*this.size+(this.size/2)};
	position = position || 0;
	if (position === 0) {
		return {'x': tile.col*TILE_SIZE + TILE_SIZE/2, 'y': tile.row*TILE_SIZE + TILE_SIZE/2};
	}
	else if (position === 1) {
		return {'x': tile.col*TILE_SIZE, 'y': tile.row*TILE_SIZE};
	}
};
/* --------------------- END TILEMAP CLASS --------------------- \*/

/* --------------------- END GAME CLASSES --------------------- \*/
var TM_str = ["wwwwwwwwwwwwwwwwwwww",
    "w          ww      w",
    "w wwwwwwww    w  www",
    "w wwww     wwww wwww",
    "w      wwwwwwww    w",
    "w wwww          wwww",
    "w      wwwwwwww    w",
    "wwwwww wwwww    wwww",
    "w  ww    wwwwww   ww",
    "w  wwwww   ww   wwww",
    "w      www  ww w   w",
    "w  wwwwwww       www",
    "w  www     wwww wwww",
    "w      wwwwwwww    w",
    "w wwww          wwww",
    "w      wwwwwwww    w",
    "wwwwww wwwww    wwww",
    "w  ww    w   ww   ww",
    "w     ww    ww  wwww",
    "wwwwwwwwwwwwwwwwwwww"];
var TM = new Tilemap(TM_str);

var pauseContinueButton = new Button(200, 200, "Continue");
var pauseHelpButton = new Button(200, 250, "Help");
var pauseExitButton = new Button(200, 300, "Exit");
var displayPauseMenu = function() {
	background(0);
	TM.draw();
	noStroke();
	fill(224, 224, 224, 150);
	rect(0, 0, 400, 400);
	
	// State Constants
    var CONTENT_X1 = 50;
    var CONTENT_X2 = 350;
    var CONTENT_W = CONTENT_X2 - CONTENT_X1;
    
    var CONTENT_Y1 = 100;
    var CONTENT_Y2 = 340;
    var CONTENT_H = CONTENT_Y2 - CONTENT_Y1;
    
    // Content Box
    stroke(0);
    fill(245, 245, 245, 250);
    rect(CONTENT_X1, CONTENT_Y1, CONTENT_W, CONTENT_H);
    fill(0);
	
	fill(0);
	textSize(30);
    text("Paused", 200, 140);
    
    stroke(0);
    pauseContinueButton.draw();
    pauseHelpButton.draw();
    pauseExitButton.draw();
};

/* --------------------- User Control --------------------- \*/
var mouseClicked = function() {
    switch(CurrentGameState) {
    case GameState.START_MENU:
        if (playButton.mouseIsOnMe()) {
            CurrentGameState = GameState.PLAYING;   
        }
        else if (helpButton.mouseIsOnMe()) {
            CurrentGameState = GameState.HELP_MENU;
        }
        else if (optionsButton.mouseIsOnMe()) {
            CurrentGameState = GameState.OPTIONS_MENU;   
        }
        break;
    
    case GameState.HELP_MENU:
        if (help_nextButton.mouseIsOnMe()) {
            CurrentGameState = GameState.CONTROLS_MENU;
        }
        break;
        
    case GameState.CONTROLS_MENU:
        if (controls_backButton.mouseIsOnMe()) {
            CurrentGameState = GameState.HELP_MENU;
        }
        else if (menuButton.mouseIsOnMe()) {
            CurrentGameState = GameState.START_MENU;   
        }
        break;
        
    case GameState.OPTIONS_MENU:
        if (menuButton.mouseIsOnMe()) {
            CurrentGameState = GameState.START_MENU;   
        }
        else {
            optionsMouseCallback();   
        }
        break;
    case GameState.PAUSED:
        if (pauseContinueButton.mouseIsOnMe()) {
            CurrentGameState = GameState.PLAYING;
        }
        else if (pauseHelpButton.mouseIsOnMe()) {
            // CurrentGameState = GameState.HELP_MENU; TODO add way back to play game
        }
        else if (pauseExitButton.mouseIsOnMe()) {
            // TODO: Reset all Game variables
            CurrentGameState = GameState.START_MENU;
        }
        break;
    default:
        break;
    }
};

keyPressed = function() {
	if (CurrentGameState === GameState.PLAYING || CurrentGameState === GameState.PAUSED) {
		KEYS[keyCode] = 1;
	}
};

/* --------------------- END User Control --------------------- \*/

var playGame = function() {
	background(0);
    TM.draw();
};

var draw = function() {
    cursor(ARROW);
    switch(CurrentGameState) {
		case GameState.PLAYING:
			playGame();
			if (KEYS[80] === 1) {
				CurrentGameState = GameState.PAUSED;
				KEYS[80] = 0;
			}
			break;
		case GameState.PAUSED:
			displayPauseMenu();
			break;
        case GameState.START_MENU:
            displayStartMenu();
            break;
        case GameState.HELP_MENU:
            displayHelpMenu();
            break;
        case GameState.OPTIONS_MENU:
            displayOptionsMenu();
            break;
        case GameState.CONTROLS_MENU:
            displayControlsMenu();
            break;
        default:
            CurrentGameState = GameState.START_MENU;
            // Should not reach default case
    }
};

/* --------------------- END PROGRAM CODE --------------------- \*/

//}};