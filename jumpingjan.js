var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

/* ^^^^^^^^^^^^^^^^^^^^^ BEGIN PROGRAM CODE ^^^^^^^^^^^^^^^^^^^^^ \*/

angleMode = 'radians';
textAlign(CENTER, CENTER);

var GameState = {
    START_MENU : 0,
    PLAYING : 1,
    HELP_MENU : 2,
    OPTIONS_MENU : 3,
    CONTROLS_MENU : 4
};
var CurrentGameState = GameState.START_MENU;

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
    debug(vertices);
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
var help_nextButton = new ArrowButton(350, 370, "Next");
var controls_backButton = new ArrowButton(50, 370, "Back", -1);
var menuButton = new Button(200, 350, "Menu");
var displayStartMenu = function() {
    background(255, 255, 255);
    fill(0);
    
    textSize(50);
    text("Jumping Janet", 200, 80);
    
    playButton.draw();
    helpButton.draw();
    optionsButton.draw();
};

var displayHelpMenu = function() {
    background(255, 0, 0, 10);
    fill(0);
    textSize(30);
    text("Instructions", 200, 140);
    
    stroke(0);
    fill(199, 197, 197, 50);
    rect(50, 200, 300, 90);
    fill(0);
    var instructions = "Jan awakens to finds herself in a strange new land. Help her get home by exploring this new world. Be weary of anyone or anything that you find as they may not be friendly!";
    textSize(14);
    text(instructions, 55, 200, 280, 90);
    
    help_nextButton.draw();
};

var displayControlsMenu = function() {
    background(20, 200, 0, 10);
    fill(0);
    textSize(30);
    text("Controls", 200, 140);
    
    stroke(0);
    fill(199, 197, 197, 50);
    rect(50, 200, 300, 90);
    fill(0);
    var instructions = "jjjjjjjjjjjjjjjjjjjjj";
    textSize(14);
    text(instructions, 55, 200, 280, 90);
    
    controls_backButton.draw();
    menuButton.draw();
};

var displayOptionsMenu = function() {
    background(0, 100, 200, 10);
    
    menuButton.draw();
};

/* --------------------- END Menu Views --------------------- \*/

/* --------------------- User Control --------------------- \*/
var mouseClicked = function() {
    if (CurrentGameState === GameState.START_MENU) {
        if (playButton.mouseIsOnMe()) {
            CurrentGameState = GameState.PLAYING;   
        }
        else if (helpButton.mouseIsOnMe()) {
            CurrentGameState = GameState.HELP_MENU;
        }
        else if (optionsButton.mouseIsOnMe()) {
            CurrentGameState = GameState.OPTIONS_MENU;   
        }
    }
    else if (CurrentGameState === GameState.HELP_MENU) {
        if (help_nextButton.mouseIsOnMe()) {
            CurrentGameState = GameState.CONTROLS_MENU;
        }
    }
    else if (CurrentGameState === GameState.CONTROLS_MENU) {
        if (controls_backButton.mouseIsOnMe()) {
            CurrentGameState = GameState.HELP_MENU;
        }
        else if (menuButton.mouseIsOnMe()) {
            CurrentGameState = GameState.START_MENU;   
        }
    }
    else if (CurrentGameState === GameState.OPTIONS_MENU) {
        if (menuButton.mouseIsOnMe()) {
            CurrentGameState = GameState.START_MENU;   
        }   
    }
};

/* --------------------- END User Control --------------------- \*/

var draw = function() {
    cursor(ARROW);
    switch(CurrentGameState) {
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

}};