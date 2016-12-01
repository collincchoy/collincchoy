var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

angleMode = 'radians';
var KEYS = [];
var TILE_SIZE = 400;

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
	average(intermed, pts);
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

var StandbyState = function() {};
StandbyState.prototype.execute = function(self) {
	//self.armAngleReset();
};

var MoveRightState = function() {};
MoveRightState.prototype.execute = function(self) {
	console.log('MoveRightState executing...');
	if (self.direction === -1) {self.legAngleReset();self.armAngleReset();}
	self.direction = 1;
	self.walk();
    //self.position.x += self.movementSpeed;
};

var MoveLeftState = function() {};
MoveLeftState.prototype.execute = function(self) {
    console.log('MoveLeftState executing...');
	if (self.direction === 1) {self.legAngleReset();self.armAngleReset();}
    self.direction = -1;
    self.walk();
    //self.position.x -= self.movementSpeed;
};

var JumpState = function() {this.jumpForce = new PVector(0, -15);};
JumpState.prototype.execute = function(self) {
    console.log('jumping');
	self.applyForce(this.jumpForce);
	self.jump();
	self.currentState = PlayerStates.FALLING;
};

var JumpRightState = function() {};
JumpRightState.prototype.execute = function(self) {
	console.log('JumpRightState executing...');
	self.position.x += self.movementSpeed/2;
};

var JumpLeftState = function() {};
JumpLeftState.prototype.execute = function(self) {
	console.log('JumpLeftState executing...');
	self.position.x -= self.movementSpeed/2;
};

var FallingState = function() {};
FallingState.prototype.execute = function(self) {
	console.log('FallingState executing...');
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
	
	this.playerColor = color(236, 166, 35);
	
	this.direction = 1;
	
	this.currentState = PlayerStates.STANDBY;
	this.STATES = [new StandbyState(), new MoveRightState(), new MoveLeftState(), new JumpState(), new JumpRightState(), new JumpLeftState(), new FallingState()];
    
    this.sunglassPoints = [{x:138, y:132}, {x:143, y:121}, {x:157, y:135}, {x:170, y:113}, {x:195, y:113}, {x:197, y:136}, {x:208, y:135}, {x:220, y:114}, {x:238, y:115}, {x:245, y:133}, {x:252, y:120}, {x:258, y:130}, {x:247, y:147}, {x:238, y:167}, {x:212, y:164}, {x:204, y:146}, {x:192, y:147}, {x:185, y:164}, {x:161, y:164}, {x:155, y:146}, ];
    
    this.subdivsLeft = 1;
    
    this.hairVertices = [{x:266, y:94}, {x:235, y:88}, {x:208, y:90}, {x:183, y:108}, {x:176, y:136}, {x:171, y:180}, {x:148, y:195}, {x:134, y:207}, {x:115, y:205}, {x:96, y:167}, {x:94, y:131}, {x:81, y:127}, {x:74, y:144}, {x:75, y:165}, {x:83, y:198}, {x:35, y:208}, {x:46, y:198}, {x:41, y:172}, {x:55, y:136}, {x:60, y:112}, {x:80, y:105}, {x:96, y:118}, {x:106, y:93}, {x:132, y:73}, {x:178, y:53}, {x:233, y:55}, {x:254, y:74}, {x:274, y:84}, {x:264, y:89},];
    this.hairVertices_bw = [{x:134, y:94}, {x:165, y:88}, {x:192, y:90}, {x:217, y:108}, {x:224, y:136}, {x:229, y:180}, {x:252, y:195}, {x:266, y:207}, {x:285, y:205}, {x:304, y:167}, {x:306, y:131}, {x:319, y:127}, {x:326, y:144}, {x:325, y:165}, {x:317, y:198}, {x:365, y:208}, {x:354, y:198}, {x:359, y:172}, {x:345, y:136}, {x:340, y:112}, {x:320, y:105}, {x:304, y:118}, {x:294, y:93}, {x:268, y:73}, {x:222, y:53}, {x:167, y:55}, {x:146, y:74}, {x:126, y:84}, {x:136, y:89}];
    
    this.armLeftVertices = [{x:148, y:241}, {x:151, y:275}, {x:165, y:297}, {x:185, y:302}, {x:189, y:282}, {x:177, y:257}, {x:179, y:244},];
    this.armLeftVertices_bw = [{x:252, y:241}, {x:249, y:275}, {x:235, y:297}, {x:215, y:302}, {x:211, y:282}, {x:223, y:257}, {x:221, y:244}];
    
    this.armRightVertices = [{x:213, y:251}, {x:219, y:285}, {x:235, y:305}, {x:255, y:308}, {x:259, y:287}, {x:244, y:264}, {x:243, y:236},];
    this.armRightVertices_bw = [{x:187, y:251}, {x:181, y:285}, {x:165, y:305}, {x:145, y:308}, {x:141, y:287}, {x:156, y:264}, {x:157, y:236}];
    
    this.legVertices = [{x:150, y:310}, {x:158, y:330}, {x:156, y:361}, {x:215, y:361}, {x:214, y:344}, {x:227, y:338}, {x:215, y:342},/*Short-Leg{x:190, y:363}*/ {x:190, y:363}, {x:250, y:361}, {x:250, y:337}, {x:246, y:322}, {x:250, y:310}, {x:200, y:310}, ];
    this.legVertices_bw = [{x:250, y:310}, {x:242, y:330}, {x:244, y:361}, {x:185, y:361}, {x:186, y:344}, {x:173, y:338}, {x:185, y:342}, {x:210, y:363}, {x:150, y:361}, {x:150, y:337}, {x:154, y:322}, {x:150, y:310}, {x:200, y:310}];
    
    this.legAngleOffset = 20;
    this.legAngleOffsetCounter = this.legAngleOffset/2;
    
    this.bootLeftVertices = this.getBootVertices(185, 377);
    this.bootLeftVertices_bw = this.getBootVertices_bw(185, 377);
    this.bootRightVertices = this.getBootVertices(220, 377);
    this.bootRightVertices_bw = this.getBootVertices_bw(220, 377);
};

Player.prototype = Object.create(Mover.prototype);
Player.prototype.constructor = Player;

Player.prototype.changeState = function(nextState) {
	this.currentState = nextState;
};

Player.prototype.changeColor = function(col) {
	this.playerColor = (col === 0) ? color(236, 165, 15) :
						(col === 1) ? color(185, 0, 0) :
                    (col === 2) ? color(80, 0, 255) :
                    (col === 3) ? color(150, 200, 20) :
                    (col === 4) ? color(228, 232, 16) : 
									color(236, 165, 15);
};

Player.prototype.getBootVertices = function(center_X, center_Y) {
    return [{x:center_X+60, y:center_Y+13}, {x:center_X+40, y:center_Y+-2}, {x:center_X+30, y:center_Y+-17}, {x:center_X+27, y:center_Y+-17}, {x:center_X+-30, y:center_Y+-17}, {x:center_X+-30, y:center_Y+-17}, {x:center_X+-30, y:center_Y+18}, {x:center_X+-30, y:center_Y+18}, {x:center_X+30, y:center_Y+18}, {x:center_X+40, y:center_Y+18}];
};

Player.prototype.getBootVertices_bw = function(center_X, center_Y) {
    return [{x:center_X-60, y:center_Y+13}, {x:center_X-40, y:center_Y+-2}, {x:center_X-30, y:center_Y+-17}, {x:center_X-27, y:center_Y+-17}, {x:center_X+30, y:center_Y+-17}, {x:center_X+30, y:center_Y+-17}, {x:center_X+30, y:center_Y+18}, {x:center_X+30, y:center_Y+18}, {x:center_X-30, y:center_Y+18}, {x:center_X-40, y:center_Y+18}];
};

Player.prototype.moveArms = function() {
	var frontArm = (this.direction === -1) ? this.armRightVertices_bw : this.armLeftVertices;
	var backArm = (this.direction === -1) ? this.armLeftVertices_bw : this.armRightVertices;
	
    var angleIncrement = 0.05*((this.legAngleOffsetCounter<0) ? -1 : 1);
    if (this.legAngleOffsetCounter <= -this.legAngleOffset-1) {
        this.legAngleOffsetCounter = this.legAngleOffset;
    }
    var leftArmPivotPoint = {x:(frontArm[0].x+frontArm[frontArm.length-1].x)/2, y:frontArm[0].y};
    for (var i = 1; i < frontArm.length; i++) {
        rotateAroundPoint(frontArm[i], leftArmPivotPoint, angleIncrement);
    }
    
    var rightArmPivotPoint = {x:(backArm[0].x+backArm[backArm.length-1].x)/2, y:backArm[0].y};
    for (var i = 1; i < backArm.length; i++) {
        rotateAroundPoint(backArm[i], rightArmPivotPoint, -angleIncrement);   
    }
	
	this.armAngle += angleIncrement;
};

Player.prototype.rotateLegsByNumOfIncrement = function(incs) {
	var legs = (this.direction === -1) ? this.legVertices_bw : this.legVertices;
    var bootLeft = (this.direction === -1) ? this.bootRightVertices_bw : this.bootLeftVertices;
    var bootRight = (this.direction === -1) ? this.bootLeftVertices_bw : this.bootRightVertices;
    
    var angleIncrement = 0.1*incs;

    var leftLegPivotPoint = {x:(legs[4].x+legs[1].x)/2, y:legs[1].y};
    
    rotateAroundPoint(legs[2], leftLegPivotPoint, angleIncrement);
    rotateAroundPoint(legs[3], leftLegPivotPoint, angleIncrement);
    for (var i = 0; i < bootLeft.length; i++) {
        rotateAroundPoint(bootLeft[i], leftLegPivotPoint, angleIncrement);   
    }
    
    var rightLegPivotPoint = {x:(legs[8].x+legs[9].x)/2, y:legs[1].y};
    rotateAroundPoint(legs[7], legs[5], -angleIncrement);
    rotateAroundPoint(legs[8], legs[5], -angleIncrement);
    rotateAroundPoint(legs[9], legs[5], -angleIncrement);
    for (var i = 0; i < bootRight.length; i++) {
        rotateAroundPoint(bootRight[i], legs[5], -angleIncrement);   
    }
};

Player.prototype.rotateArmsByAngle = function(theta) {
	var armLeft = (this.direction === -1) ? this.armRightVertices_bw : this.armLeftVertices;
	var armRight = (this.direction === -1) ? this.armLeftVertices_bw : this.armRightVertices;
	
	var leftArmPivotPoint = {x:(armLeft[0].x+armLeft[armLeft.length-1].x)/2, y:armLeft[0].y};
    for (var i = 1; i < armLeft.length; i++) {
        rotateAroundPoint(armLeft[i], leftArmPivotPoint, theta);
    }
    
    var rightArmPivotPoint = {x:(armRight[0].x+armRight[armRight.length-1].x)/2, y:armRight[0].y};
    for (var i = 1; i < armRight.length; i++) {
        rotateAroundPoint(armRight[i], rightArmPivotPoint, -theta);
    }
};

Player.prototype.moveLegs = function() {    
    var angleIncrement = (this.legAngleOffsetCounter<0) ? -1 : 1;
	
	this.rotateLegsByNumOfIncrement(angleIncrement);
    	
	this.legAngleOffsetCounter = (this.legAngleOffsetCounter-1 < -this.legAngleOffset) ? this.legAngleOffset-1 : this.legAngleOffsetCounter-1;
};

Player.prototype.walk = function() {
    this.moveArms();
    this.moveLegs();
};

Player.prototype.jumpReset = function() {
	var angleIncrement = 3 * TWO_PI / 4;

    this.rotateArmsByAngle(angleIncrement);
	
	this.armAngle -= TWO_PI/4;
};

Player.prototype.armAngleReset = function() {
	var angleIncrement = -1 * this.armAngle;

    this.rotateArmsByAngle(angleIncrement);
	
	this.armAngle = 0;
};

Player.prototype.legAngleReset = function() {	
	if (this.legAngleOffsetCounter >= 0) {
		var base = this.legAngleOffset/2;
		var base_offset = this.legAngleOffsetCounter - base;
		
		this.rotateLegsByNumOfIncrement(base_offset);
		this.legAngleOffsetCounter = this.legAngleOffset/2;
	}
	else {
		var base = -this.legAngleOffset/2;
		var base_offset = base - this.legAngleOffsetCounter-2;
		
		this.rotateLegsByNumOfIncrement(base_offset);
		this.legAngleOffsetCounter = this.legAngleOffset/2;
	}
};

Player.prototype.jump = function() {
	var angleIncrement = TWO_PI / 4;
	this.armAngleReset();
	this.legAngleReset();

    this.rotateArmsByAngle(angleIncrement);
	
	this.armAngle += angleIncrement;
};

Player.prototype.update = function() {
	// State Transitions
	if (KEYS[87] === 1) { // w was pressed
		this.changeState(PlayerStates.JUMP);
		KEYS[87] = 0;
	}
	else if (KEYS[65] === 1 && (this.currentState === PlayerStates.FALLING || this.currentState === PlayerStates.JUMP)) {
		this.changeState(PlayerStates.JUMP_LEFT);
		KEYS[65] = 0;
	} 
	else if (KEYS[65] === 1) {
		this.changeState(PlayerStates.MOVE_LEFT);
		KEYS[65] = 0;
	}
	else if (KEYS[68] === 1 && (this.currentState === PlayerStates.FALLING || this.currentState === PlayerStates.JUMP)) {
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
    var backArm = [];
    var backHand = [];
    var frontArm = [];
    var frontHand = [];
    var legs = [];
    var hair = [];
    var backBoot = [];
    var frontBoot = [];
    if (this.direction === 1) {
        backArm = this.armRightVertices;
        backHand = this.armRightVertices[3];
        frontArm = this.armLeftVertices;
        frontHand = this.armLeftVertices[3];
        legs = this.legVertices;
        hair = this.hairVertices;
        frontBoot = this.bootLeftVertices;
        backBoot = this.bootRightVertices;
    }
    else if (this.direction === -1) {
        backArm = this.armRightVertices_bw;
        backHand = this.armRightVertices_bw[3];
        frontArm = this.armLeftVertices_bw;
        frontHand = this.armLeftVertices_bw[3];
        legs = this.legVertices_bw;
        hair = this.hairVertices_bw;
        backBoot = this.bootLeftVertices_bw;
        frontBoot = this.bootRightVertices_bw;
    }
    
    pushMatrix();
    
    translate(this.position.x-this.size/2, this.position.y-this.size/2);
	scale(this.size/400);

    noFill();
    
    // Back Arm
    stroke(0);
    fill(this.playerColor);
    drawShapeFromVertices(backArm, true);
    
    // Back Hand
    stroke(0);
    fill(255, 206, 168);
    ellipse(backHand.x, backHand.y, 45 , 45);
    
    // Body
    stroke(0);
    fill(this.playerColor);
    ellipse(200, 275, 115, 150);
    
    // Head
    stroke(0);
    fill(255, 206, 168);
    ellipse(200, 150, 175, 175);
    
    // Eyes
    if (this.direction === 1) {
        stroke(0);
        fill(245, 245, 245);
        ellipse(215, 140, 15, 50);
        ellipse(260, 140, 15, 50);
        fill(0);
        ellipse(218, 140, 9, 35);
        ellipse(262, 140, 9, 35);
    }
    else if (this.direction === -1) {
        stroke(0);
        fill(245, 245, 245);
        ellipse(185, 140, 15, 50);
        ellipse(140, 140, 15, 50);
        fill(0);
        ellipse(182, 140, 9, 35);
        ellipse(138, 140, 9, 35);
    }
    
    // Hair
    stroke(0);
    fill(61, 33, 22);
    drawShapeFromVertices(hair);
    
    // Mouth
    stroke(0);
    strokeWeight(2.5);
    if (this.direction === 1) {
        line(215, 200, 255, 200);
    }
    else if (this.direction === -1) {
        line(185, 200, 145, 200);
    }
    strokeWeight(1);
    
    // Nose
    fill(224, 121, 112);
    if (this.direction === 1) {
        ellipse(245, 165, 45, 35);
    }
    else if (this.direction === -1) {
        ellipse(155, 165, 45, 35);
    }
    
    // Front Arm
    stroke(0);
    fill(this.playerColor);
    drawShapeFromVertices(frontArm, true);
    
    // Back Boots
    fill(101, 89, 89);
    stroke(0);
    drawShapeFromVertices(backBoot);
    
    // Legs
    stroke(0);
    fill(146, 64, 38);
    drawShapeFromVertices(legs);

    // Front Boot
    fill(101, 89, 89);
    stroke(0);
    drawShapeFromVertices(frontBoot);
    
    // Front Hand
    fill(255, 206, 168);
    ellipse(frontHand.x, frontHand.y, 50, 50);
    
    if (this.subdivsLeft > 0) {
        subdivide(this.hairVertices);
        subdivide(this.bootLeftVertices);
        subdivide(this.bootRightVertices);
        
        subdivide(this.hairVertices_bw);
        subdivide(this.bootLeftVertices_bw);
        subdivide(this.bootRightVertices_bw);
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
var p = new Player(200, 200);
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
	console.log(p.legAngleOffsetCounter)
    p.update();
    p.draw();
    var bbe = p.getBoundingBoxEdges();
    stroke(0);
    noFill();
    rect(bbe.left, bbe.top, p.getWidth(), p.getHeight());
    
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();   
    }
};


}};