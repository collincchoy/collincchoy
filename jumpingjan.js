var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

/* ^^^^^^^^^^^^^^^^^^^^^ BEGIN PROGRAM CODE ^^^^^^^^^^^^^^^^^^^^^ \*/

angleMode = 'radians';
var KEYS = [];
var GRAVITY = new PVector(0,0.6); // TODO remove
textAlign(CENTER, CENTER);

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

/* --------------------- Color Selector Object --------------------- \*/

var ColorSelectorBox = function(x, y, col) {
    this.position = new PVector(x, y);
    this.size = 10;
    
    this.selected = false;
    
    this.color = (col === 'r') ? color(185, 0, 0) :
                    (col === 'b') ? color(80, 0, 255) :
                    (col === 'g') ? color(150, 200, 20) :
                    (col === 'y') ? color(236, 166, 35) :
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

var Sun = function() {this.ang = 0; this.maxRayLength = 20;};

Sun.prototype.drawRay = function(len, ang) {
    pushMatrix();
    rotate(ang);
    var a = len;//random(30);
    stroke(217, 222, 69);
    //point((x < 130) ? x++ : , 0);
    line(100, 0, 100+a, 0);
    popMatrix();
};

Sun.prototype.draw = function() {
    strokeWeight(2);
    fill(217, 222, 69);
    pushMatrix(); 
    translate(400, 0);
    rotate(this.ang+=0.01);
    var cnt = 5;
    var curL = 0;
    for (var i = 0; i < TWO_PI; i += PI/128) {
        if (curL > cnt) {
            curL = -cnt;
        }
        else if (curL === 0) {
            //curL++;
        }
        
        var len = (++curL < 0) ? -curL : curL;
        this.drawRay(this.maxRayLength/len, i);
    }
    
    ellipse(0, 0, 200, 200);
    popMatrix();
};

/* --------------------- GAME Variables --------------------- \*/
var TILE_SIZE = 40;
var NUM_TILES = 400/TILE_SIZE;
var SETTINGS_PLAYER_COLOR = 0;

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

/***************************************************************************
					MOVER BASE CLASS
***************************************************************************/
var Mover = function(x, y, tm) {
	this.position = new PVector(x, y);
	this.nextPosition = new PVector(0, 0);
	this.velocity = new PVector(0, 0);
	this.nextVelocity = new PVector(0, 0);
	this.acceleration = new PVector(0, 0);
	
	this.tm = tm;
	
	this.mass = 1;
	this.height = 0;
	this.width = 0;
	this.size = TILE_SIZE;
	
	this.movementSpeed = 0;
	this.maxSpeed = 0;

	
	this.restitution = 0;
	
	this.isAffectedByGravity = false;
	this.isAffectedByCollisions = false;
	this.onGround = false;
	this.wasOnGround = false;
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
	
	var l1 = new Coord(myEdges.left*scaleFactor, myEdges.top*scaleFactor);
    var r1 = new Coord(myEdges.right*scaleFactor, myEdges.bottom*scaleFactor);
    var l2 = new Coord(otherEdges.left*scaleFactor, otherEdges.top*scaleFactor);
    var r2 = new Coord(otherEdges.right*scaleFactor, otherEdges.bottom*scaleFactor);
    
    if (l1.compare(r2) === 1 || l2.compare(r1) === 1) {
        return false;   
    }
    
    if (l1.compare(r2) === -1 || l2.compare(r1) === -1) {
        return false;   
    }
    
    if ((r1.x <= l2.x && r1.y <= l2.y) || (l1.x >= r2.x && l1.y >= r2.y)) {
        return false;
    }
    
    return true;
};

Mover.prototype.checkStandingOn = function(mover) {
    var myEdges = this.getBoundingBoxEdges();
	
    var otherEdges = mover.getBoundingBoxEdges();
    var scaleFactor = this.getScaleFactor();
    
    var l1 = new Coord(myEdges.left*scaleFactor, myEdges.top*scaleFactor);
    var r1 = new Coord(myEdges.right*scaleFactor, myEdges.bottom*scaleFactor);
    var l2 = new Coord(otherEdges.left*scaleFactor, otherEdges.top*scaleFactor);
    var r2 = new Coord(otherEdges.right*scaleFactor, otherEdges.bottom*scaleFactor);
    
	var dy = 1;
	
    if (abs(r1.y - l2.y) > dy) {
		return false;
	}
    
    if (l1.compare(r2) === -1 || l2.compare(r1) === -1) {
        return false;   
    }
    
    return true;
};

Mover.prototype.resolveCollision = function(A, B, norm) {
	// Calculate relative velocity
	var rv = PVector.sub(B.velocity, A.velocity);

	// Calculate relative velocity in terms of the normal direction
	var velAlongNormal = rv.dot(norm);

	// Do not resolve if velocities are separating
	if(velAlongNormal > 0) {
		return;
	}

	// Calculate restitution
	var e = min( A.restitution, B.restitution);

	// Calculate impulse scalar
	var j = -(1 + e) * velAlongNormal;
	j /= 1 / A.mass + 1 / B.mass;

	// Apply impulse
	var impulse = PVector.mult(normal, j);
	A.velocity.sub(PVector.div(impulse, A.mass));
	B.velocity.add(PVector.div(impulse, B.mass));
};

Mover.prototype.setPreCollisionVariables = function() {
	this.wasOnGround = this.onGround;
	this.onGround = false;
};

Mover.prototype.handleCollision = function() {
	// AABB containing current position and next position
	var minPos = new PVector(0, 0);
	minPos.x = min(this.position.x, this.nextPosition.x);
	minPos.y = min(this.position.y, this.nextPosition.y);
	var maxPos = new PVector(0, 0);
	maxPos.x = max(this.position.x, this.nextPosition.x);
	maxPos.y = max(this.position.y, this.nextPosition.y);
	
	// Extend AABB to bound entire object - position is from the center
	minPos.sub(new PVector(this.getWidth()/2, this.getHeight()/2));
	maxPos.add(new PVector(this.getWidth()/2, this.getHeight()/2));
	
	fill(255, 0, 0);
	ellipse(minPos.x, minPos.y, 20, 20);
	fill(0, 0, 255);
	ellipse(maxPos.x, maxPos.y, 20, 20);
	
	// Extend AABB a bit more - helps when player is very close to boundary of a cell
	// Note: not sure if need this or not
	//minPos.add(5, 5);
	//maxPos.sub(5, 5);
	
	this.setPreCollisionVariables();
	
	this.tm.checkForCollisions(minPos, maxPos, this);
};

Mover.prototype.resolveLanding = function() {};

Mover.prototype.CollisionResolution = function(normal, distanceToPlane) {
	var separation = max(distanceToPlane, 0);
	var penetration = min(distanceToPlane, 0);
	
	var dt = 60; // TODO. maybe this should be something
	var normal_velocity = this.nextVelocity.dot(normal) + separation/dt;	
	
	this.nextPosition.sub(PVector.mult(normal, penetration/dt));
	
	if ( normal_velocity < 0 ) {
		// remove normal velocity
		this.nextVelocity.sub(PVector.mult(normal, normal_velocity));
		
		if (normal.y < 0) {
			this.onGround = true;
			
			if (!this.wasOnGround) {
				this.resolveLanding();
			}
		}
	}
};

Mover.prototype.update = function() {
	if (this.isAffectedByGravity) {
		this.applyForce(GRAVITY);
	}
	
	this.nextVelocity = PVector.add(this.velocity, this.acceleration); // TODO maybe don't need this
	var nextVelocityYDirection = (this.nextVelocity.y > 0) ? 1 : -1;
	// Clamp max speed
	this.nextVelocity.y = nextVelocityYDirection * min(this.maxSpeed, abs(this.nextVelocity.y));
	this.nextVelocity.x = nextVelocityYDirection * min(this.maxSpeed, abs(this.nextVelocity.x));
	
	this.nextPosition.add(PVector.add(this.position, this.nextVelocity));
	
	if (this.isAffectedByCollisions) {
		// TODO handle collision
		/*if (this.nextPosition.y >= 400-TILE_SIZE-this.getHeight()/2 + 1) { // on Ground
			this.onGround = true;
			if (this.nextVelocity.y > 0) { // moving toward ground
				this.nextVelocity.set(this.nextVelocity.x, 0);
				this.nextPosition.y = this.position.y;
			}
		}
		else {
			this.onGround = false;
		}*/
		
		this.handleCollision();
	}
	this.position.set(this.nextPosition);
	this.velocity.set(this.nextVelocity);
	
	this.acceleration.mult(0);
	this.nextPosition.set(0, 0);
	this.nextVelocity.set(0, 0);
	
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
	
	this.isAffectedByGravity = false;
	this.isAffectedByCollisions = false;
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
	//self.armAngleReset();
};

var MoveRightState = function() {};
MoveRightState.prototype.execute = function(self) {
	if (self.direction === -1) {self.legAngleReset();self.armAngleReset();}
	self.direction = 1;
	self.walk();
};

var MoveLeftState = function() {};
MoveLeftState.prototype.execute = function(self) {
	if (self.direction === 1) {self.legAngleReset();self.armAngleReset();}
    self.direction = -1;
    self.walk();
    self.position.x -= self.movementSpeed;
};

var JumpState = function() {this.jumpForce = new PVector(0, -24);};
JumpState.prototype.execute = function(self) {
	self.applyForce(this.jumpForce);
	self.jump();
	self.currentState = PlayerStates.FALLING;
};

var JumpRightState = function() {};
JumpRightState.prototype.execute = function(self) {
	self.position.x += self.movementSpeed/2;
};

var JumpLeftState = function() {};
JumpLeftState.prototype.execute = function(self) {
	self.position.x -= self.movementSpeed/2;
};

var FallingState = function() {};
FallingState.prototype.execute = function(self) {};
/***************************************************************************
					PLAYER CLASS
***************************************************************************/

var Player = function(x, y, tm) {
    Mover.apply(this, arguments);
	
    this.position = new PVector(x, y);
	this.mass = 10;
	this.height = 390;
	this.width = 300;
	this.size = TILE_SIZE;
	
	this.isAffectedByGravity = true;
	this.isAffectedByCollisions = true;
	this.onGround = true;
	
	this.movementSpeed = 3;
	this.jumpForce = new PVector(0, -25);
	this.jumped = 0;
	
	this.maxSpeed = 20;
	
	this.armAngle = 0;
	
	this.playerColor = color(236, 166, 35);
	
	this.direction = 1;
	
	this.currentState = PlayerStates.STANDBY;
	this.STATES = [new StandbyState(), new MoveRightState(), new MoveLeftState(), new JumpState(), new JumpRightState(), new JumpLeftState(), new FallingState()];
    
    this.sunglassPoints = [{x:138, y:132}, {x:143, y:121}, {x:157, y:135}, {x:170, y:113}, {x:195, y:113}, {x:197, y:136}, {x:208, y:135}, {x:220, y:114}, {x:238, y:115}, {x:245, y:133}, {x:252, y:120}, {x:258, y:130}, {x:247, y:147}, {x:238, y:167}, {x:212, y:164}, {x:204, y:146}, {x:192, y:147}, {x:185, y:164}, {x:161, y:164}, {x:155, y:146}, ];
    
    this.subdivsLeft = 1;
    
	//{ Character Vertices
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
	//}
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

Player.prototype.resolveLanding = function() {
	this.jumped = 0;
	this.jumpReset();
};

Player.prototype.keyboardCallback = function() {
	if (KEYS[87] === 2) { // w was pressed - Jump
		//if (this.jumped < 2) {
			this.applyForce(this.jumpForce);
			this.jump();
			this.jumped++;
		//}
		
		KEYS[87] = 0;
	}
	
	if (KEYS[65] === 1) { // a was pressed - Walk Left
		if (this.direction === 1 && this.onGround) {this.legAngleReset();this.armAngleReset();}
		this.direction = -1;
		if (this.onGround) {
			this.walk();
		}
		this.nextPosition.x -= this.movementSpeed;
		
		//KEYS[65] = 0;
	}
	else if (KEYS[68] === 1) { // d was pressed - Walk Right
		if (this.direction === -1 && this.onGround) {this.legAngleReset();this.armAngleReset();}
		this.direction = 1;
		if (this.onGround) {
			this.walk();
		}
		this.nextPosition.x += this.movementSpeed;
		
		//KEYS[68] = 0;
	}
};

Player.prototype.update = function() {
	var isLanding = this.onGround;
	
	// State Transitions
	/*if (KEYS[87] === 1) { // w was pressed
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
	
	// Look ahead for collisions and react
	
	this.STATES[this.currentState].execute(this);
	
	if (this.position.y > 400 + this.height/2) {
	    this.position.y = 200;
		this.velocity.set(0, 0);
	}
	else {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
	}
	this.acceleration.mult(0);*/
	this.keyboardCallback();
	
	Mover.prototype.update.call(this);
	
	if (!isLanding && this.onGround && (this.jumped > 0)) { // Landed this frame
		this.jumped = 0;
		this.jumpReset();
	}
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

var getAABBvsAABB_Distance = function(a, b) {
	return PVector.sub(b.position, a.position);
};

var getAABBvsAABB_ContactInfo = function(a, b, delta) {
	var a_halfExtents = new PVector(a.getWidth(), a.getHeight());
	var b_halfExtents = new PVector(b.getWidth(), b.getHeight());
	
	var combinedPos = new PVector(b.position.x, b.position.y);
	var combinedHalfExtents = PVector.add(a_halfExtents, b_halfExtents);
	
	var normalPlane = (abs(delta.x) > abs(delta.y)) ? new PVector(delta.x, 0) : new PVector(0, delta.y);
	normalPlane.normalize();
	normalPlane.mult(-1);
		
	var centerPlane = new PVector(normalPlane.x * combinedHalfExtents.x, 
									normalPlane.y * combinedHalfExtents.y);
	centerPlane.add(combinedPos);
	
	// Get distance from point(center of a) to the plane
	var planeDelta = PVector.sub(a.position, centerPlane);
	var distanceToPlane = planeDelta.dot(normalPlane);
	
	return {norm:normalPlane, dist: distanceToPlane, point: a.position, impulse: 0};
};

Tilemap.prototype.getMaxRow = function() {
	return this.TM.length-1;
};

Tilemap.prototype.getMaxCol = function() {
	return this.TM[0].length-1;
};

Tilemap.prototype.checkInternalCollision = function(tile, normal) {
	var nextTile = {row:tile.row+normal.x, col:tile.col+normal.y};

	var nextTileType = this.getTileTypeAtTile(nextTile);
	return (nextTileType === 'p' && this.onGround);
};

Tilemap.prototype.checkForCollisions = function(minV, maxV, object) {		
	var minTile = Tilemap.getTileFromCoordinate(minV);
	maxV.add(0.5, 0.5);
	var maxTile = Tilemap.getTileFromCoordinate(maxV);
	// Possibly add a little wiggle room to maxTile like +0.5

	for (var r = minTile.row; r <= min(this.getMaxRow(), maxTile.row); r++) {
		for (var c = minTile.col; c <= min(this.getMaxCol(), maxTile.col); c++) {
			console.log('row: ' + r + ' col: ' + c);
            if (this.TM[r][c] === 'p') {
				var currentPlatform = 0;
				// Get the tile's AABB
				for (var i = 0; i < this.platforms.length; i++) {
					var tilePos = Tilemap.getTileFromCoordinate(this.platforms[i].position);
					if (tilePos.row === r && tilePos.col === c) {
						currentPlatform = this.platforms[i];
						break;
					}
				}
				
				var delta = getAABBvsAABB_Distance(object, currentPlatform);
				var contact = getAABBvsAABB_ContactInfo(object, currentPlatform, delta);
				var internalColResult = this.checkInternalCollision({'row':r, 'col':c}, contact.norm);

				var collisionDetected = !internalColResult;
				if (collisionDetected) {
					object.CollisionResolution(contact.norm, contact.dist);
					console.log("COLLISSION DETECTED");
				}
			}
        }
	}
};

Tilemap.prototype.drawWall = function(x, y) {
    image(getImage("cute/WallBlockTall"), x, y, this.size, this.size);
};

Tilemap.prototype.draw = function(){
    for (var i = 0; i < this.walls.length; i++) {
        this.drawWall(this.walls[i].x, this.walls[i].y);
    }
	
	for (var i = 0; i < this.platforms.length; i++) {
		this.platforms[i].draw();
	}
};

Tilemap.prototype.getTileTypeAtTile = function(tile) {
	console.log(tile.col);
	if (tile.row > this.getMaxRow() || tile.col > this.getMaxCol()) {
		return 0;
	}
	
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
    return {'row': Math.floor(coordinate.y/TILE_SIZE), 'col': Math.floor(coordinate.x/TILE_SIZE)};
};

// Param: tile - {row: _, col: _}
// Param: position - 0 = CENTER, 1 = TOP-LEFT-CORNER
// Return: Coord - {x: _, y: _} Note: returns the CENTER-Coord of the tile by default
Tilemap.getCoordinateFromTile = function(tile, position) {
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
				 "         p",
				 "pppppppppp"];	
				 
var simpleMap = ["          ",
				"          ",
				"          ",
				"          ",
				"          ",
				"          ",
				"          ",
				"         p",
				"        pp",
				"pppppppppp"];

var TM = new Tilemap(simpleMap);

var GameState = {
    START_MENU : 0,
    PLAYING : 1,
    HELP_MENU : 2,
    OPTIONS_MENU : 3,
    CONTROLS_MENU : 4,
	PAUSED : 5,
};

var StartMenuState = function() {
    this.a=random(1500);
    this.mountains = 0; 
    this.sun = new Sun();
    this.bigJan = new Player(200, 350);
    
	this.playButton = new Button(200, 200, "Play");
	this.helpButton = new Button(200, 250, "Help");
	this.optionsButton = new Button(200, 300, "Options");
};
var PlayingState = function() {
	this.hadCollision = false;
	var startTile = Tilemap.getCoordinateFromTile({row:8, col:2}, 0);
	this.Jan = new Player(startTile.x, startTile.y, TM);
	this.gravity = new PVector(0,0.6);
};
var HelpMenuState = function() {
	this.nextButton = new ArrowButton(350, 350, "Next");
};
var OptionsMenuState = function() {
    this.menuButton = new Button(200, 350, "Menu");
    
	this.playerColorSelector = new ColorSelector(50+(0.35*300), 180+(0.3*100));
	this.playerColorSelector.add('y');
    this.playerColorSelector.add('r');
    this.playerColorSelector.add('b');
    this.playerColorSelector.add('g');
};
var ControlsMenuState = function() {
	this.backButton = new ArrowButton(50, 350, "Back", -1);
	this.menuButton = new Button(200, 350, "Menu");
};
var PausedState = function() {
    this.continueButton = new Button(200, 200, "Continue");
    this.helpButton = new Button(200, 250, "Help");
    this.exitButton = new Button(200, 300, "Exit");
};

var GameStates = [new StartMenuState(), new PlayingState(), new HelpMenuState(), new OptionsMenuState(), new ControlsMenuState(), new PausedState()];

//var CurrentGameState = GameState.START_MENU; TODO switch back
var CurrentGameState = GameState.PLAYING;
/* --------------------- Menu Views --------------------- \*/
StartMenuState.prototype.setMountains = function() {
    this.mountains = [[],[],[],[],[],[]]; 
    for (var i=0; i<=5; i++) {
        for (var j=0; j<=40; j++) {
            var n = noise(this.a);
            this.mountains[i][j] = map(n,0,1,0,400-i*50);
            this.a += 0.025;  // ruggedness
        }
    }  
};

StartMenuState.prototype.drawBackground = function() {
    noStroke();
    if (this.mountains === 0) {
        this.setMountains();
    }
    // sky
    var n1 = this.a;  
    for (var x=0; x<=400; x+=8) {
        var n2 = 0;
        for (var y=0; y<=250; y+=8) {
            var c = map(noise(n1,n2),0,1,0,255);
            fill(c, c, c+70,150);
            rect(x,y,8,8);
            n2 += 0.05; // step size in noise
        }
        n1 += 0.02; // step size in noise
    }
    this.a -= 0.01;  // speed of clouds
    
    // mountains
    for (x=0; x<=5; x++) {
        for (var y=0; y<=40; y++) {
            fill(10 + x*5, 40+x*10, 0);
            // draw quads of width 10 pixels
            quad(y*10,this.mountains[x][y]+x*55,(y+1)*10,this.mountains[x][y+1]+(x)*55,(y+1)*10,400,y*10,400);
        }
    }
    
    this.sun.draw();
};

StartMenuState.prototype.display = function() {
    background(255, 255, 255);
	this.bigJan.changeColor(SETTINGS_PLAYER_COLOR);
    
    this.drawBackground();
    this.bigJan.size = 150;
    this.bigJan.walk();
    this.bigJan.draw();
    
	// State Constants
    var CONTENT_X1 = 50;
    var CONTENT_X2 = 350;
    var CONTENT_W = CONTENT_X2 - CONTENT_X1;
    
    var CONTENT_Y1 = 160;
    var CONTENT_Y2 = 340;
    var CONTENT_H = CONTENT_Y2 - CONTENT_Y1;
    
    // Content Box
    fill(199, 197, 197, 50);
    noStroke();
    rect(CONTENT_X1, CONTENT_Y1, CONTENT_W, CONTENT_H);
    fill(0);
	
    fill(0);
    stroke(0);
    
    textSize(50);
    text("Jumping Jan", 200, 80);
    
    textSize(20);
    text("Collin C. Choy", 75, 380);
    
    this.playButton.draw();
    this.helpButton.draw();
    this.optionsButton.draw();
};

StartMenuState.prototype.MouseCallback = function() {
    if (this.playButton.mouseIsOnMe()) {
        CurrentGameState = GameState.PLAYING;   
    }
    else if (this.helpButton.mouseIsOnMe()) {
        CurrentGameState = GameState.HELP_MENU;
    }
    else if (this.optionsButton.mouseIsOnMe()) {
        CurrentGameState = GameState.OPTIONS_MENU;   
    }
};

HelpMenuState.prototype.display = function() {
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
    
    this.nextButton.draw();
};

HelpMenuState.prototype.MouseCallback = function() {
    if (this.nextButton.mouseIsOnMe()) {
        CurrentGameState = GameState.CONTROLS_MENU;
    }
};

ControlsMenuState.prototype.drawKey = function(x, y, label, width) {
    var KEY_SIZE_W = width || 20;
    var KEY_SIZE_H = 20;
    fill(245, 245, 245);
    rect(x-KEY_SIZE_W/2, y-KEY_SIZE_H/2, KEY_SIZE_W, KEY_SIZE_H);
    
    fill(0);
    text(label, x, y);
};

ControlsMenuState.prototype.display = function() {
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
    this.drawKey(CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H), 'W');
    this.drawKey(CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H)+25, 'S');
    this.drawKey(CONTENT_X1+(0.25*CONTENT_W)-25, CONTENT_Y1+(0.3*CONTENT_H)+25, 'A');
    this.drawKey(CONTENT_X1+(0.25*CONTENT_W)+25, CONTENT_Y1+(0.3*CONTENT_H)+25, 'D');
    text("Move Jan", CONTENT_X1+(0.25*CONTENT_W), CONTENT_Y1+(0.8*CONTENT_H));
    
    this.drawKey(CONTENT_X1+(0.75*CONTENT_W), CONTENT_Y1+(0.3*CONTENT_H), 'P');
    this.drawKey(CONTENT_X1+(0.75*CONTENT_W)-15, CONTENT_Y1+(0.7*CONTENT_H), "Space", 50);
    textAlign(LEFT, CENTER);
    text("Pause", CONTENT_X1+(0.75*CONTENT_W)+15, CONTENT_Y1+(0.3*CONTENT_H));
    text("Action", CONTENT_X1+(0.75*CONTENT_W)+15, CONTENT_Y1+(0.7*CONTENT_H));
    
    textAlign(CENTER, CENTER);
    this.backButton.draw();
    this.menuButton.draw();
};

ControlsMenuState.prototype.MouseCallback = function() {
    if (this.backButton.mouseIsOnMe()) {
        CurrentGameState = GameState.HELP_MENU;
    }
    else if (this.menuButton.mouseIsOnMe()) {
        CurrentGameState = GameState.START_MENU;   
    }
};

OptionsMenuState.prototype.display = function() {
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

    this.playerColorSelector.setSelectedIndex(SETTINGS_PLAYER_COLOR);
    
    this.playerColorSelector.draw();
    
    this.menuButton.draw();
};

OptionsMenuState.prototype.MouseCallback = function() {
    if (this.menuButton.mouseIsOnMe()) {
        CurrentGameState = GameState.START_MENU;   
    }
    else if (this.playerColorSelector.mouseIsOnMe()) {
        for (var i = 0; i < this.playerColorSelector.items.length; i++) {
            if (this.playerColorSelector.items[i].mouseIsOnMe()) {
                this.playerColorSelector.setSelectedIndex(i);
                SETTINGS_PLAYER_COLOR = i;
                break;
            }
        }
    }
};

PausedState.prototype.display = function() {
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
    this.continueButton.draw();
    this.helpButton.draw();
    this.exitButton.draw();
};

PausedState.prototype.MouseCallback = function() {
    if (this.continueButton.mouseIsOnMe()) {
        CurrentGameState = GameState.PLAYING;
    }
    else if (this.helpButton.mouseIsOnMe()) {
        // CurrentGameState = GameState.HELP_MENU; TODO add way back to play game
    }
    else if (this.exitButton.mouseIsOnMe()) {
        // TODO: Reset all Game variables
        CurrentGameState = GameState.START_MENU;
    }  
};

PlayingState.prototype.display = function() {
	background(0);
    TM.draw();
	this.Jan.changeColor(SETTINGS_PLAYER_COLOR);
	
	/*var collisionDetected = false;
	var collidedObject = 0;
	for (var i = 0; i < TM.platforms.length; i++) {
		collisionDetected = this.Jan.checkCollision(TM.platforms[i]);
		if (collisionDetected) {
			collidedObject = TM.platforms[i];
		    break;
		}
	}
	
	if(!collisionDetected) {
	    this.Jan.applyForce(this.gravity);
	    this.hadCollision = false;
    }
    else {
		fill(255, 0, 0);
		ellipse(collidedObject.position.x, collidedObject.position.y, 30, 30);
        if (!this.hadCollision) {
            this.Jan.velocity.set(0,0); 
            this.hadCollision = true;
			if (this.Jan.currentState === PlayerStates.FALLING) {
				this.Jan.jumpReset();
				this.Jan.changeState(PlayerStates.STANDBY);
			}
			else if (this.Jan.currentState === PlayerStates.MOVE_RIGHT || this.Jan.currentState === PlayerStates.MOVE_LEFT) {
				this.Jan.changeState(PlayerStates.FALLING);
			}
        }
    }*/
	
	this.Jan.update();
	this.Jan.draw();
	var temp = this.Jan.getBoundingBoxEdges();
	rect(temp.left, (temp.top), temp.right-temp.left, temp.bottom-temp.top);
	
	if (KEYS[80] === 1) {
		CurrentGameState = GameState.PAUSED;
		KEYS[80] = 0;
	}
};

/* --------------------- END Menu Views --------------------- \*/

/* --------------------- User Control --------------------- \*/
var mouseClicked = function() {
    GameStates[CurrentGameState].MouseCallback();
};

keyPressed = function() {
	if (CurrentGameState === GameState.PLAYING || CurrentGameState === GameState.PAUSED) {
		KEYS[keyCode] = 1;
	}
};

keyReleased = function() {
	if (CurrentGameState === GameState.PLAYING || CurrentGameState === GameState.PAUSED) {
		if (keyCode === 87) {
			KEYS[87] = 2;
		}
		else {
			KEYS[keyCode] = 0;
		}
	}
};

/* --------------------- END User Control --------------------- \*/
var draw = function() {
    cursor(ARROW);

	GameStates[CurrentGameState].display();
};

/* --------------------- END PROGRAM CODE --------------------- \*/

}};