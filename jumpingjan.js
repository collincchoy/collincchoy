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
var Coord = function(x, y){
    this.x = x;
    this.y = y;
};
Coord.prototype.compare = function(other) {
    if (this.x === other.x && this.y === other.y) {
        return 0;   
    }
    else if (this.x > other.x && this.y < other.y) {
        return 1;
    }
    else if (this.x < other.x && this.y > other.y) {
        return -1;   
    }
    else {
        return -100;   
    }
};

var splitPoints = function(pts) {
    var p2 = [];
    for (var i = 0; i < pts.length - 1; i++) {
        p2.push(new PVector(pts[i].x, pts[i].y));
        p2.push(new PVector((pts[i].x + pts[i+1].x)/2, (pts[i].y +
pts[i+1].y)/2));
    }  
    p2.push(new PVector(pts[i].x, pts[i].y));
    p2.push(new PVector((pts[0].x + pts[i].x)/2, (pts[0].y +
pts[i].y)/2));

	return p2;
};  

var average = function(p2, pts) {
    for (var i = 0; i < p2.length - 1; i++) {
        var x = (p2[i].x + p2[i+1].x)/2;
        var y = (p2[i].y + p2[i+1].y)/2;
        p2[i].set(x, y);
    } 
    var x = (p2[i].x + pts[0].x)/2;
    var y = (p2[i].y + pts[0].y)/2;
    pts.splice(0, pts.length);
    for (i = 0; i < p2.length; i++) {
        pts.push(new PVector(p2[i].x, p2[i].y));   
    }    
};    

var subdivide = function(pts) {
	var intermed = splitPoints(pts);
	this.average(intermed, pts);
}; 

var drawShapeFromVertices = function(vertices, notClosed) {
    notClosed |= false;
    
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);   
    }
    if (!notClosed) {
        vertex(vertices[0].x, vertices[0].y);
    }
    endShape();
};

// Rotates an (x, y) p1 around an (x, y) p2 by n radians
var rotateAroundPoint = function(p1, p2, n) {
    var translatedVertex = new PVector(p1.x-p2.x, p1.y-p2.y);
        
    var cosn = cos(n);
    var sinn = sin(n);
    var rotatedVertex = new PVector(translatedVertex.x*cosn - translatedVertex.y*sinn, translatedVertex.y*cosn + translatedVertex.x*sinn);
        
    p1.x = rotatedVertex.x+p2.x;            
    p1.y = rotatedVertex.y+p2.y;
};

/***************************************************************************
					MOVER BASE CLASS
***************************************************************************/
var Mover = function(x, y) {
	this.position = new PVector(x, y);
	this.velocity = new PVector(0, 0);
	this.acceleration = new PVector(0, 0);
	
	this.mass = 1;
	this.height = 0;
	this.width = 0;
	this.size = TILE_SIZE;
	
	this.movementSpeed = 0;
};

Mover.prototype.applyForce = function(force) {
	this.acceleration.add(PVector.div(force, this.mass));
};

Mover.prototype.getWidth = function() {return this.width*(this.size/400);};
Mover.prototype.getHeight = function() {return this.height*(this.size/400);};
Mover.prototype.getScaleFactor = function() {return this.size/400;};

Mover.prototype.getBoundingBoxEdges = function() {
    return {top:this.position.y-this.getHeight()/2, bottom:this.position.y+this.getHeight()/2, left: this.position.x-this.getWidth()/2, right:this.position.x+this.getWidth()/2};  
};

Mover.prototype.checkCollision = function(mover) {
    var myEdges = this.getBoundingBoxEdges();

    var otherEdges = mover.getBoundingBoxEdges();
    var scaleFactor = this.getScaleFactor();
    
    var l1 = new Coord(myEdges.top*scaleFactor, myEdges.left*scaleFactor);
    var r1 = new Coord(myEdges.bottom*scaleFactor, myEdges.right*scaleFactor);
    var l2 = new Coord(otherEdges.top*scaleFactor, otherEdges.left*scaleFactor);
    var r2 = new Coord(otherEdges.bottom*scaleFactor, otherEdges.right*scaleFactor);
    
    if (l1.compare(r2) === 1 || l2.compare(r1) === 1) {
        return false;   
    }
    
    if (l1.compare(r2) === -1 || l2.compare(r1) === -1) {
        return false;   
    }
    
    if ((r1.x < l2.x && r1.y < l2.y) || (l1.x > r2.x && l1.y > r2.y)) {
        return false;
    }
    
    return true;
};

/***************************************************************************
					PLATFORM CLASS
***************************************************************************/
var Platform = function(x, y, width) {
	Mover.apply(this, arguments);
	
	this.width = width;
	this.height = TILE_SIZE;
	this.mass = 1000;
	
	this.size = 400;
};

Platform.prototype = Object.create(Mover.prototype);
Platform.prototype.constructor = Platform;

Platform.prototype.draw = function() {
	var left = this.position.x - this.width/2;
	var right = this.position.x + this.width/2;
	var top = this.position.y - this.height/2;
	var bottom = this.position.y + this.height/2;
	
	
	stroke(218, 200, 198);
	fill(218, 200, 198);
	rect(left, top, this.width, this.height);
};
/***************************************************************************
					PLAYER STATES
***************************************************************************/
var PlayerStates = {
    STANDBY : 0,
    MOVE_RIGHT : 1,
    MOVE_LEFT : 2,
    JUMP : 3,
    JUMP_RIGHT : 4,
    JUMP_LEFT : 5,
	FALLING : 6,
};

var StandbyState = function() {};
StandbyState.prototype.execute = function(self) {
	self.armAngleReset();
};

var MoveRightState = function() {};
MoveRightState.prototype.execute = function(self) {
	debug('MoveRightState executing...');
	self.walk();
    self.position.x += self.movementSpeed;
};

var MoveLeftState = function() {};
MoveLeftState.prototype.execute = function(self) {
    debug('MoveLeftState executing...');
    self.position.x -= self.movementSpeed;
};

var JumpState = function() {this.jumpForce = new PVector(0, -15);};
JumpState.prototype.execute = function(self) {
    debug('jumping');
	self.applyForce(this.jumpForce);
	self.jump();
	self.currentState = PlayerStates.FALLING;
};

var JumpRightState = function() {};
JumpRightState.prototype.execute = function(self) {
	debug('JumpRightState executing...');
	self.position.x += self.movementSpeed/2;
};

var JumpLeftState = function() {};
JumpLeftState.prototype.execute = function(self) {
	debug('JumpLeftState executing...');
	self.position.x -= self.movementSpeed/2;
};

var FallingState = function() {};
FallingState.prototype.execute = function(self) {
	debug('FallingState executing...');
};
/***************************************************************************
					PLAYER CLASS
***************************************************************************/

var Player = function(x, y) {
    Mover.apply(this, arguments);
    this.position = new PVector(x, y);
	this.mass = 10;
	this.height = 390;
	this.width = 300;
	this.size = TILE_SIZE;
	
	this.movementSpeed = 5;
	
	this.armAngle = 0;
	
	this.falling = false;
	
	this.currentState = PlayerStates.STANDBY;
	this.STATES = [new StandbyState(), new MoveRightState(), new MoveLeftState(), new JumpState(), new JumpRightState(), new JumpLeftState(), new FallingState()];
    
    this.sunglassPoints = [{x:138, y:132}, {x:143, y:121}, {x:157, y:135}, {x:170, y:113}, {x:195, y:113}, {x:197, y:136}, {x:208, y:135}, {x:220, y:114}, {x:238, y:115}, {x:245, y:133}, {x:252, y:120}, {x:258, y:130}, {x:247, y:147}, {x:238, y:167}, {x:212, y:164}, {x:204, y:146}, {x:192, y:147}, {x:185, y:164}, {x:161, y:164}, {x:155, y:146}, ];
    
    this.subdivsLeft = 1;
    
    this.hairVertices = [{x:266, y:94}, {x:235, y:88}, {x:208, y:90}, {x:183, y:108}, {x:176, y:136}, {x:171, y:180}, {x:148, y:195}, {x:134, y:207}, {x:115, y:205}, {x:96, y:167}, {x:94, y:131}, {x:81, y:127}, {x:74, y:144}, {x:75, y:165}, {x:83, y:198}, {x:35, y:208}, {x:46, y:198}, {x:41, y:172}, {x:55, y:136}, {x:60, y:112}, {x:80, y:105}, {x:96, y:118}, {x:106, y:93}, {x:132, y:73}, {x:178, y:53}, {x:233, y:55}, {x:254, y:74}, {x:274, y:84}, {x:264, y:89},];
    
    this.armLeftVertices = [{x:148, y:241}, {x:151, y:275}, {x:165, y:297}, {x:185, y:302}, {x:189, y:282}, {x:177, y:257}, {x:179, y:244},];
    
    this.armRightVertices = [{x:213, y:251}, {x:219, y:285}, {x:235, y:305}, {x:255, y:308}, {x:259, y:287}, {x:244, y:264}, {x:243, y:236},];
    
    this.legVertices = [{x:150, y:310}, {x:158, y:330}, {x:156, y:361}, {x:215, y:361}, {x:214, y:344}, {x:227, y:338}, {x:215, y:342},/*Short-Leg{x:190, y:363}*/ {x:190, y:363}, {x:250, y:361}, {x:250, y:337}, {x:246, y:322}, {x:250, y:310}, {x:200, y:310}, ];
    this.legAngleOffset = 20;
    this.legAngleOffsetCounter = this.legAngleOffset/2;
    
    this.bootLeftVertices = this.getBootVertices(185, 377);
    this.bootRightVertices = this.getBootVertices(220, 377);
};

Player.prototype = Object.create(Mover.prototype);
Player.prototype.constructor = Player;

Player.prototype.changeState = function(nextState) {
	this.currentState = nextState;
};

Player.prototype.getBootVertices = function(center_X, center_Y) {
    return [{x:center_X+60, y:center_Y+13}, {x:center_X+40, y:center_Y+-2}, {x:center_X+30, y:center_Y+-17}, {x:center_X+27, y:center_Y+-17}, {x:center_X+-30, y:center_Y+-17}, {x:center_X+-30, y:center_Y+-17}, {x:center_X+-30, y:center_Y+18}, {x:center_X+-30, y:center_Y+18}, {x:center_X+30, y:center_Y+18}, {x:center_X+40, y:center_Y+18}];
};

Player.prototype.moveArms = function() {
    var angleIncrement = 0.05*((this.legAngleOffsetCounter<0) ? -1 : 1);
    if (this.legAngleOffsetCounter <= -this.legAngleOffset-1) {
        this.legAngleOffsetCounter = this.legAngleOffset;
    }
    var leftArmPivotPoint = {x:(this.armLeftVertices[0].x+this.armLeftVertices[this.armLeftVertices.length-1].x)/2, y:this.armLeftVertices[0].y};
    for (var i = 1; i < this.armLeftVertices.length; i++) {
        rotateAroundPoint(this.armLeftVertices[i], leftArmPivotPoint, angleIncrement);
    }
    
    var rightArmPivotPoint = {x:(this.armRightVertices[0].x+this.armRightVertices[this.armRightVertices.length-1].x)/2, y:this.armRightVertices[0].y};
    for (var i = 1; i < this.armRightVertices.length; i++) {
        rotateAroundPoint(this.armRightVertices[i], rightArmPivotPoint, -angleIncrement);   
    }
	
	this.armAngle += angleIncrement;
};

Player.prototype.moveLegs = function() {
    var angleIncrement = 0.1*((this.legAngleOffsetCounter<0) ? -1 : 1);
    if (this.legAngleOffsetCounter <= -this.legAngleOffset) {
        this.legAngleOffsetCounter = this.legAngleOffset;
    }

    var leftLegPivotPoint = {x:(this.legVertices[4].x+this.legVertices[1].x)/2, y:this.legVertices[1].y};
    
    rotateAroundPoint(this.legVertices[2], leftLegPivotPoint, angleIncrement);
    rotateAroundPoint(this.legVertices[3], leftLegPivotPoint, angleIncrement);
    for (var i = 0; i < this.bootLeftVertices.length; i++) {
        rotateAroundPoint(this.bootLeftVertices[i], leftLegPivotPoint, angleIncrement);   
    }
    
    var rightLegPivotPoint = {x:(this.legVertices[8].x+this.legVertices[9].x)/2, y:this.legVertices[1].y};
    rotateAroundPoint(this.legVertices[7], this.legVertices[5], -angleIncrement);
    rotateAroundPoint(this.legVertices[8], this.legVertices[5], -angleIncrement);
    rotateAroundPoint(this.legVertices[9], this.legVertices[5], -angleIncrement);
    for (var i = 0; i < this.bootRightVertices.length; i++) {
        rotateAroundPoint(this.bootRightVertices[i], this.legVertices[5], -angleIncrement);   
    }
    
    this.legAngleOffsetCounter--;
};

Player.prototype.walk = function() {
    this.moveArms();
    this.moveLegs();
};

Player.prototype.jump = function() {
	var angleIncrement = TWO_PI / 4;

    var leftArmPivotPoint = {x:(this.armLeftVertices[0].x+this.armLeftVertices[this.armLeftVertices.length-1].x)/2, y:this.armLeftVertices[0].y};
    for (var i = 1; i < this.armLeftVertices.length; i++) {
        rotateAroundPoint(this.armLeftVertices[i], leftArmPivotPoint, angleIncrement);
    }
    
    var rightArmPivotPoint = {x:(this.armRightVertices[0].x+this.armRightVertices[this.armRightVertices.length-1].x)/2, y:this.armRightVertices[0].y};
    for (var i = 1; i < this.armRightVertices.length; i++) {
        rotateAroundPoint(this.armRightVertices[i], rightArmPivotPoint, -angleIncrement);   
    }
	
	this.armAngle += angleIncrement;
};

Player.prototype.jumpReset = function() {
	var angleIncrement = 3 * TWO_PI / 4;

    var leftArmPivotPoint = {x:(this.armLeftVertices[0].x+this.armLeftVertices[this.armLeftVertices.length-1].x)/2, y:this.armLeftVertices[0].y};
    for (var i = 1; i < this.armLeftVertices.length; i++) {
        rotateAroundPoint(this.armLeftVertices[i], leftArmPivotPoint, angleIncrement);
    }
    
    var rightArmPivotPoint = {x:(this.armRightVertices[0].x+this.armRightVertices[this.armRightVertices.length-1].x)/2, y:this.armRightVertices[0].y};
    for (var i = 1; i < this.armRightVertices.length; i++) {
        rotateAroundPoint(this.armRightVertices[i], rightArmPivotPoint, -angleIncrement);   
    }
	
	this.armAngle -= TWO_PI/4;
};

Player.prototype.armAngleReset = function() {
	var angleIncrement = -1 * this.armAngle;

    var leftArmPivotPoint = {x:(this.armLeftVertices[0].x+this.armLeftVertices[this.armLeftVertices.length-1].x)/2, y:this.armLeftVertices[0].y};
    for (var i = 1; i < this.armLeftVertices.length; i++) {
        rotateAroundPoint(this.armLeftVertices[i], leftArmPivotPoint, angleIncrement);
    }
    
    var rightArmPivotPoint = {x:(this.armRightVertices[0].x+this.armRightVertices[this.armRightVertices.length-1].x)/2, y:this.armRightVertices[0].y};
    for (var i = 1; i < this.armRightVertices.length; i++) {
        rotateAroundPoint(this.armRightVertices[i], rightArmPivotPoint, -angleIncrement);   
    }
	
	this.armAngle = 0;
};

Player.prototype.update = function() {
	
	if (KEYS[87] === 1) { // w was pressed
		this.changeState(PlayerStates.JUMP);
		KEYS[87] = 0;
	}
	else if (KEYS[65] === 1 && this.currentState === PlayerStates.FALLING) {
		this.changeState(PlayerStates.JUMP_LEFT);
		KEYS[65] = 0;
	} 
	else if (KEYS[65] === 1) {
		this.changeState(PlayerStates.MOVE_LEFT);
		KEYS[65] = 0;
	}
	else if (KEYS[68] === 1 && this.currentState === PlayerStates.FALLING) {
		this.changeState(PlayerStates.JUMP_RIGHT);
		KEYS[68] = 0;
	}
	else if (KEYS[68] === 1) {
		this.changeState(PlayerStates.MOVE_RIGHT);
		KEYS[68] = 0;
	}
	else if (this.currentState === PlayerStates.FALLING) {
		
	}
	else {
	    this.changeState(PlayerStates.STANDBY);   
	}
	
	this.STATES[this.currentState].execute(this);
	
	if (this.position.y > 400 + this.height/2) {
	    this.position.y = 200;
		this.velocity.set(0, 0);
	}
	else {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
	}
	this.acceleration.mult(0);
};

Player.prototype.draw = function() {
    pushMatrix();
    
    translate(this.position.x-this.size/2, this.position.y-this.size/2);
	scale(this.size/400);

    noFill();
    
    // Back Arm
    stroke(0);
    fill(236, 166, 35);
    drawShapeFromVertices(this.armRightVertices, true);
    
    // Front Hand
    stroke(0);
    fill(255, 206, 168);
    ellipse(this.armRightVertices[3].x, this.armRightVertices[3].y, 45 , 45);
    
    // Body
    stroke(0);
    fill(236, 166, 35);
    ellipse(200, 275, 115, 150);
    
    // Head
    stroke(0);
    fill(255, 206, 168);
    ellipse(200, 150, 175, 175);
    
    // Eyes
    stroke(0);
    fill(245, 245, 245);
    ellipse(215, 140, 15, 50);
    ellipse(260, 140, 15, 50);
    fill(0);
    ellipse(218, 140, 9, 35);
    ellipse(262, 140, 9, 35);
    
    // Hair
    stroke(0);
    fill(61, 33, 22);
    drawShapeFromVertices(this.hairVertices);
    
    // Mouth
    stroke(0);
    strokeWeight(2.5);
    line(215, 200, 255, 200);
    strokeWeight(1);
    
    // Nose
    fill(224, 121, 112);
    ellipse(245, 165, 45, 35);
    
    // Front Arm
    stroke(0);
    fill(236, 166, 35);
    drawShapeFromVertices(this.armLeftVertices, true);
    
    // Back Boots
    fill(101, 89, 89);
    stroke(0);
    drawShapeFromVertices(this.bootRightVertices);
    
    // Legs
    stroke(0);
    fill(146, 64, 38);
    drawShapeFromVertices(this.legVertices);

    // Front Boot
    fill(101, 89, 89);
    stroke(0);
    drawShapeFromVertices(this.bootLeftVertices);
    
    // Front Hand
    fill(255, 206, 168);
    ellipse(this.armLeftVertices[3].x, this.armLeftVertices[3].y, 50, 50);
    
    if (this.subdivsLeft > 0) {
        subdivide(this.hairVertices);
        //subdivide(this.armLeftVertices);
        subdivide(this.bootLeftVertices);
        subdivide(this.bootRightVertices);
        this.subdivsLeft--;
    }
	
	popMatrix();
};

/***************************************************************************
					TILEMAP CLASS
***************************************************************************/
var Tilemap = function(tm) {
	this.TM = tm;
	this.walls = [];
	this.platforms = [];
	
	this.size = TILE_SIZE;
	
	// initialize Platforms list
	for (var row = 0; row < this.TM.length; row++) {
		for (var col = 0; col < this.TM[row].length; col++) {
            switch(this.TM[row][col]) {
                case 'p':
					var newCoord = {x:col*this.size + this.size/2, y: row*this.size + this.size/2};
                    this.platforms.push(new Platform(newCoord.x, newCoord.y, this.size));
                    break;
                default:
                    // Do nothing
            }
        }
	}
	
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
	
	for (var i = 0; i < this.platforms.length; i++) {
		this.platforms[i].draw();
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
var TM_wallsample = ["wwwwwwwwwwwwwwwwwwww",
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

var TM_sample10x10 = ["pppp    pp",
				 "       pp ",
				 "pppp    p ",
				 "       ppp",
				 "      p   ",
				 "          ",
				 "p  p p    ",
				 " p    p   ",
				 "          ",
				 "pppppppppp"];	

var TM = new Tilemap(TM_sample10x10);

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
var hadCollision = false;
var Jan = new Player(100, 200);
var gravity = new PVector(0,0.4);

var playGame = function() {
	background(0);
    TM.draw();
	
	var collisionDetected = false;
	for (var i = 0; i < TM.platforms.length; i++) {
		collisionDetected = Jan.checkCollision(TM.platforms[i]);
		if (collisionDetected) {
		    break;
		}
	}
	
	if(!collisionDetected) {
	    Jan.applyForce(gravity);
	    hadCollision = false;
    }
    else {
        if (!hadCollision) {
            Jan.velocity.set(0,0); 
            hadCollision = true;
			if (Jan.currentState === PlayerStates.FALLING) {
				Jan.jumpReset();
				Jan.changeState(PlayerStates.STANDBY);
			}
        }
    }
	
	Jan.update();
	Jan.draw();
	
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