window.onload = function() {

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame   ||
    window.mozRequestAnimationFrame      ||
    window.oRequestAnimationFrame        ||
    window.msRequestAnimationFrame       ||
    function(callback){ window.setTimeout(callback, 1000 / 60); };
})();

/*
    http://jsfiddle.net/kmHZt/10/

*/


function Tile0() {
    this.walkable = true;
    this.color = '#fff';
}
function Tile1() {
    this.walkable = false;
    this.color = '#ddd';
}

/********************
 *
 * Hero Class
 * 
 */
function Hero(canvasWidth, canvasHeight) {
    this.speed = 200;

    // x e y sono riferiti al centro dell'oggetto
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.height = 40;
    this.width = 40;
    
    
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style['position'] = 'absolute';
    this.canvas.style['left'] = '30%';
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    this.ctx = this.canvas.getContext("2d");
}

Hero.prototype.redraw = function () {
    this.ctx.fillStyle = '#999';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

}


/********************
 *
 * Game Class
 * 
 */

function Game() {
    this.bgcolor = '#eee';
    this.squareSize = 50;

    /*

                       x
        -+------------------->
         |
         |
         |
      y  |
         |
         v

    */
    
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
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style['position'] = 'absolute';
    this.canvas.style['left'] = '30%';
    this.canvas.style['background'] = this.bgcolor;
    this.canvas.style['border'] = "1px solid #333";
    this.canvas.width = this.mapWidth * this.squareSize; 
    this.canvas.height = this.mapHeight * this.squareSize; 
    this.ctx = this.canvas.getContext("2d");
    
    this.keysDown = {}
    document.onkeydown = this.keyDown.bind(this);;
    document.onkeyup = this.keyUp.bind(this);;
    
    this.buildMap(); 

    this.hero = new Hero(this.canvas.width, this.canvas.height);
    
  /*  this.hero.x = 180;
    this.hero.y = 70;
    this.mainLoop(); */

    this._then = Date.now();
    //setInterval(this.mainLoop.bind(this), 10)

    window.requestAnimFrame(this.mainLoop.bind(this));
}

Game.prototype.calculateCollisions = function(x, y, obj) {
    var upY = Math.floor( (y - obj.height / 2) / this.squareSize);
    var downY = Math.floor( (y + obj.height / 2 - 1) / this.squareSize);
    var leftX = Math.floor( (x - obj.width / 2) / this.squareSize);
    var rightX = Math.floor( (x + obj.width / 2 - 1) / this.squareSize);
    //console.log("x:"+ x + " y:" + y + " upY:" + upY + " downY:" + downY + " leftX:" + leftX + " rightX:" + rightX);
    walkable = {};
    walkable.upleft = this.tiles[upY][leftX].walkable;
    walkable.upright = this.tiles[upY][rightX].walkable;
    walkable.downleft = this.tiles[downY][leftX].walkable;
    walkable.downright = this.tiles[downY][rightX].walkable;

    return walkable;
}

Game.prototype.update = function(modifier) {
    var delta = Math.floor(this.hero.speed * modifier)
    // up
    if (38 in this.keysDown) { 
        walkable = this.calculateCollisions(this.hero.x, this.hero.y - delta, this.hero);
        if (walkable.upleft && walkable.upright) {
            this.hero.y -= delta;
        }
    }
    // down
    if (40 in this.keysDown) { 
        walkable = this.calculateCollisions(this.hero.x, this.hero.y + delta, this.hero);
        if (walkable.downleft && walkable.downright) {
            this.hero.y += delta; 
        }
    }
    // left
    if (37 in this.keysDown) { 
        walkable = this.calculateCollisions(this.hero.x - delta, this.hero.y, this.hero);
        if (walkable.upleft && walkable.downleft) {
            this.hero.x -= delta;
        }
    }
    // right
    if (39 in this.keysDown) { 
        walkable = this.calculateCollisions(this.hero.x + delta, this.hero.y, this.hero);
        if (walkable.upright && walkable.downright) {
            this.hero.x += delta;
        }
    }

    this.redraw();
}

Game.prototype.mainLoop = function() {
    var now = Date.now();
    var delta = now - this._then;

    this.update(delta / 1000);

    this._then = now;
    
    window.requestAnimFrame(this.mainLoop.bind(this));
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

Game.prototype.redraw = function() {
    this.hero.redraw();
}

Game.prototype.drawSquare = function(x, y, fillStyle) {
    var dimX = x * this.squareSize;
    var dimY = y * this.squareSize;
    this.ctx.fillStyle = fillStyle;
    this.ctx.rect(dimX, dimY, this.squareSize, this.squareSize);
    this.ctx.fillRect(dimX + 1, dimY + 1, this.squareSize - 1, this.squareSize - 1);
}


var game = new Game();
}();
