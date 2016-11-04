var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

angleMode = 'radians';
textAlign(CENTER, CENTER);

var GameState = {
    START_MENU : 0,
    PLAYING : 1,
    HELP_MENU : 2,
    OPTIONS_MENU : 3
};
var CurrentGameState = GameState.START_MENU;

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

Button.prototype.draw = function() {
    if (this.mouseIsOnMe()) {
        fill(200, 200, 200);
        cursor(HAND);
    }
    else {
        noFill();
    }
    beginShape();
        vertex(this.getCornerPositionX("upper_left"), this.getCornerPositionY("upper_left"));
        vertex(this.getCornerPositionX("upper_right"), this.getCornerPositionY("upper_right"));
        vertex(this.getCornerPositionX("lower_right"), this.getCornerPositionY("lower_right"));
        vertex(this.getCornerPositionX("lower_left"), this.getCornerPositionY("lower_left"));
    endShape(CLOSE);
    
    fill(0);
    textSize(16);
    text(this.text, this.position.x, this.position.y);
};

var playButton = new Button(200, 200, "Play");
var helpButton = new Button(200, 250, "Help");
var optionsButton = new Button(200, 300, "Options");
var displayStartMenu = function() {
    background(255, 255, 255);
    fill(0);
    
    textSize(50);
    text("Jumping Jan", 200, 80);
    
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
    var instructions = "Venture out to the bottom of the ocean and help the fish by popping some bubbles. Sit back, relax, and pop away! Don't let too many bubbles escape or you'll have to start over again.";
    textSize(14);
    text(instructions, 55, 200, 280, 90);
};

var displayOptionsMenu = function() {
    background(0, 100, 200, 10);
};

/* User Control */
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
};

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
        default:
            // Should not reach default case
    }
};


}};