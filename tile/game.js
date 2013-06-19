window.onload = function() {


function Tile0() {
    this.walkable = true;
    this.color = '#fff';
}
function Tile1() {
    this.walkable = false;
    this.color = '#333';
}

function Hero(canvas) {
    this.speed = 200;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.oldX = 0;
    this.oldY = 0;
    this.height = 50;
    this.width = 50;

    // walking hit directions
    this.upleft = true;
    this.downleft = true;
    this.upright = true;
    this.downright = true;
}

function Game() {
    this.bgcolor = '#eee';
    this.squareSize = 50;
    
    this.map = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];

    this.tiles = [];

    this.mapWidth = this.map[0].length;
    this.mapHeight = this.map.length;

    document.body.style['background'] = '#ccc';
    
    // canvas
    this.mapCanvas = document.createElement('canvas');
    document.body.appendChild(this.mapCanvas);
    this.mapCanvas.style['position'] = 'absolute';
    this.mapCanvas.style['left'] = '30%';
    this.mapCanvas.style['background'] = this.bgcolor;
    this.mapCanvas.style['border'] = "1px solid #333";
    this.mapCanvas.width = this.mapWidth * this.squareSize; 
    this.mapCanvas.height = this.mapHeight * this.squareSize; 
    this.mapCtx = this.mapCanvas.getContext("2d");
    
    this.heroCanvas = document.createElement('canvas');
    document.body.appendChild(this.heroCanvas);
    this.heroCanvas.style['position'] = 'absolute';
    this.heroCanvas.style['left'] = '30%';
    this.heroCanvas.width = this.mapWidth * this.squareSize; 
    this.heroCanvas.height = this.mapHeight * this.squareSize; 
    this.heroCtx = this.heroCanvas.getContext("2d");



    this.keysDown = {}
    document.onkeydown = this.keyDown.bind(this);;
    document.onkeyup = this.keyUp.bind(this);;
    
    this.buildMap(); 

    this.hero = new Hero(this.heroCanvas);

    this._then = Date.now();
    //setInterval(this.mainLoop.bind(this), 10);
}

Game.prototype.calculateCollissions = function(x, y) {
    var downY = Math.floor( (y + this.hero.height - 1) / this.squareSize);
    var upY = Math.floor( (y - this.hero.height) / this.squareSize) + 1;
    var leftX = Math.floor( (x - this.hero.width) / this.squareSize) + 1;
    var rightX = Math.floor( (x + this.hero.width - 1) / this.squareSize);
//    console.log(upY + " " + downY + " " + leftX + " " + rightX);
    this.hero.upleft = this.tiles[upY][leftX].walkable;
    this.hero.upright = this.tiles[upY][rightX].walkable;
    this.hero.downleft = this.tiles[downY][leftX].walkable;
    this.hero.downright = this.tiles[downY][rightX].walkable;
 //   console.log(this.hero);
}

Game.prototype.update = function(modifier) {
    var newX = -1;
    var newY = -1;
    // up
    if (38 in this.keysDown) { 
        newY = this.hero.y - Math.floor(this.hero.speed * modifier);
    }
    // down
    if (40 in this.keysDown) { 
        newY = this.hero.y + Math.floor(this.hero.speed * modifier);
    }
    // left
    if (37 in this.keysDown) { 
        newX = this.hero.x - Math.floor(this.hero.speed * modifier);
    }
    // right
    if (39 in this.keysDown) { 
        newX = this.hero.x + Math.floor(this.hero.speed * modifier);
    }
   
    if ( newX >= 0 && newY >= 0) {
        this.calculateCollissions(newX, newY);
        this.hero.x = newX;
        this.hero.y = newY;
    } else {
        if (newX >= 0) {
            this.calculateCollissions(newX, this.hero.y);
            this.hero.x = newX;
        }
        if (newY >= 0) {
            this.calculateCollissions(this.hero.x, newY);
            this.hero.y = newY;
        }
    }
}

Game.prototype.mainLoop = function() {
    var now = Date.now();
    var delta = now - this._then;

    this.update(delta / 1000);
    this.redrawHero();

    this._then = now;
}

Game.prototype.keyDown = function(e) {
    var key = e.keyCode;
    this.keysDown[key] = true;
}

Game.prototype.keyUp = function(e) {
    var key = e.keyCode;
    delete this.keysDown[key];
}

Game.prototype.buildMap = function() {
    for (var i = 0; i < this.mapHeight; i++) {
        this.tiles[i] = [];
        for (var j = 0; j < this.mapWidth; j++) {
            if (this.map[i][j] == 1) {
                this.tiles[i][j] = new Tile1();
            } else {
                this.tiles[i][j] = new Tile0();
            }
            this.drawSquare(j, i, this.tiles[i][j].color);
        }
    }
}

Game.prototype.redrawHero = function() {
    this.heroCtx.fillStyle = '#800';
    this.heroCtx.clearRect(this.hero.oldX, this.hero.oldY, this.hero.width, this.hero.height);
    this.heroCtx.fillRect(this.hero.x, this.hero.y, this.hero.width, this.hero.height);
    this.hero.oldX = this.hero.x;
    this.hero.oldY = this.hero.y;
}

Game.prototype.drawSquare = function(x, y, fillStyle) {
    var dimX = x * this.squareSize;
    var dimY = y * this.squareSize;
    this.mapCtx.fillStyle = fillStyle;
    this.mapCtx.rect(dimX, dimY, this.squareSize, this.squareSize);
    this.mapCtx.fillRect(dimX + 1, dimY + 1, this.squareSize - 1, this.squareSize - 1);
}


var game = new Game();
}();
