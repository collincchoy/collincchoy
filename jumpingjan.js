var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

var GameState = {
    START_MENU : 0,
    PLAYING : 1,
    HELP_MENU : 2,
    OPTIONS_MENU : 3
};
var CurrentGameState = GameState.START_MENU;

var Button = function(x, y, txt) {
    this.position = new PVector(x, y);
    this.text = txt;
};

/* User Control */
var mouseClicked = function() {
    if (CurrentGameState === GameState.START_MENU) {
        if (mouseX > 174 && mouseX < 230 && mouseY > 285 && mouseY < 302) {
            CurrentGameState = GameState.PLAYING;
        }   
    }
};

var displayStartMenu = function() {
    background(255, 255, 255);
    fill(0);
    
    textSize(50);
    text("Jumping Jan", 60, 80);
    
    if (mouseX > 174 && mouseX < 230 && mouseY > 285 && mouseY < 302) {
        fill(255, 0, 0);
    }
    else {
        fill(0);
    }
    textSize(16);
    text("START", 173, 300);
};

var displayHelpMenu = function() {
    fill(0);
    textSize(30);
    text("Instructions", 125, 140);
    
    stroke(0);
    fill(199, 197, 197, 50);
    rect(50, 180, 300, 90);
    fill(0);
    var instructions = "Venture out to the bottom of the ocean and help the fish by popping some bubbles. Sit back, relax, and pop away! Don't let too many bubbles escape or you'll have to start over again.";
    textSize(14);
    text(instructions, 55, 190, 280, 90);
};

var displayOptionsMenu = function() {
    
};

var draw = function() {
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