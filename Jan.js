angleMode = 'radians';
var KEYS = [];
var TILE_SIZE = 100;

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
	var intermed = this.splitPoints(pts);
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

/*****************************PLAYER STATES*****************************/

var PlayerStates = {
    STANDBY : 0,
    MOVE_RIGHT : 1,
    MOVE_LEFT : 2,
    JUMP : 3,
    JUMP_RIGHT : 4,
    JUMP_LEFT : 5,
	FALLING : 6,
};

var StandbyState = function() {
    
};

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

var JumpState = function() {
    this.jumpForce = new PVector(0, -15);
};

JumpState.prototype.execute = function(self) {
    debug('jumping');
	self.applyForce(this.jumpForce);
	self.jump();
	self.currentState = PlayerStates.FALLING;
};

var JumpRightState = function() {
    
};

JumpRightState.prototype.execute = function(self) {
	debug('JumpRightState executing...');
	self.position.x += self.movementSpeed/2;
};

var JumpLeftState = function() {
    
};

JumpLeftState.prototype.execute = function(self) {
	debug('JumpLeftState executing...');
	self.position.x -= self.movementSpeed/2;
};

var FallingState = function() {
	
};

FallingState.prototype.execute = function(self) {
	debug('FallingState executing...');
};

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
    
    return true;
};

/*****************************PLATFORM CLASS*****************************/
var Platform = function(x, y, width) {
	Mover.apply(this, arguments);
	
	this.width = width;
	this.height = 25;
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

/*****************************PLAYER CLASS*****************************/

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

var drawFrameGrid = function() {
    stroke(115, 141, 150, 150);
    fill(0);
    textSize(10);
    for (var i = 0; i < 400; i+=25) {
        line(i, 0, i, 400);
        line(0, i, 400, i);
        text("" + i, i, 395);
        text("" + i, 0, i);
    }  
};

var gravity = new PVector(0,0.4);
var p = new Player(100, 200);
var platforms = [new Platform(200, 405, 400)];

mouseClicked = function() {
	//p.applyForce(new PVector(0, -50));
};

keyPressed = function() {
	KEYS[keyCode] = 1;
};

var hadCollision = false;
draw = function() {
    background(255, 255, 255);
    drawFrameGrid();
    
    if(!p.checkCollision(platforms[0])) {
	    p.applyForce(gravity);
	    hadCollision = false;
    }
    else {
        if (!hadCollision) {
            p.velocity.set(0,0); 
            hadCollision = true;
			if (p.currentState === PlayerStates.FALLING) {
				p.jumpReset();
				p.changeState(PlayerStates.STANDBY);
			}
        }
    }
    p.update();
    p.draw();
    var bbe = p.getBoundingBoxEdges();
    stroke(0);
    noFill();
    rect(bbe.left, bbe.top, p.getWidth(), p.getHeight());
    
    for (var p = 0; p < platforms.length; p++) {
        platforms[p].draw();   
    }
};
