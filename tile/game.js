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
    this.color = '#444';
}

/********************
 *
 * Bullet Class
 * 
 */
function Bullet(hero) {
    this.x = hero.x;
    this.y = hero.y;

    this.speed = 300;

    this.height = 6;
    this.width = 6;
    
    // bullet directions. Can be 1, 0 or -1
    this.dirY = 0;
    this.dirX = 0;
    
    this.hero = hero;
    this.canvas = hero.canvas; 
    this.ctx = hero.ctx;

}

Bullet.prototype.update = function(modifier) {
    this._erase();

    var delta = Math.floor(this.speed * modifier)
    var deltaY = this.dirY * delta;
    var deltaX = this.dirX * delta;

    var walkable = this.hero.game.calculateBoardCollissions(this.x + deltaX, this.y + deltaY, this);
    var moved = false;
    if (this.dirY == 1 && walkable.downleft && walkable.downright) { 
        this.y += deltaY;
        moved = true;
    }
    if (this.dirY == -1 && walkable.upleft && walkable.upright) { 
        this.y += deltaY;
        moved = true;
    }
    if (this.dirX == -1 && walkable.upleft && walkable.downleft) { 
        this.x += deltaX;
        moved = true;
    }
    if (this.dirX == 1 && walkable.upright && walkable.downright) { 
        this.x += deltaX;
        moved = true;
    }

    if (moved) this._draw();

    return moved;
}

Bullet.prototype._erase = function() {
    this.ctx.clearRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

Bullet.prototype._draw = function() {
    this.ctx.fillStyle = '#800';
    this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

/********************
 *
 * Hero Class
 * 
 */
function Hero(canvas, game) {
    this.speed = 200;
    this.maxBullets = 5;

    // x e y sono riferiti al centro dell'oggetto
    this.height = 20;
    this.width = 20;
    
    this.canvas = canvas; 
    this.game = game;
    this.ctx = this.canvas.getContext("2d");
    
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;

    // hero directions. Can be 1 or -1
    this.dirY = 1;
    this.dirX = 1;

    this.bullets = [];
    
    this.keysDown = {}
    var self = this;
    document.addEventListener('keydown', function(e) {self.keyDown.call(self, e)}, false );
    document.addEventListener('keyup', function(e) {self.keyUp.call(self, e)}, false );
    
    this._draw();
}

Hero.prototype.update= function(modifier) {
    var delta = Math.floor(this.speed * modifier)
    
    // up w
    if (87 in this.keysDown) { 
        walkable = this.game.calculateBoardCollissions(this.x, this.y - delta, this);
        if (walkable.upleft && walkable.upright) {
            this._erase();
            this.y -= delta;
            this.dirY = -1;
            this._draw();
        }
    }
    // down s
    if (83 in this.keysDown) { 
        walkable = this.game.calculateBoardCollissions(this.x, this.y + delta, this);
        if (walkable.downleft && walkable.downright) {
            this._erase();
            this.y += delta; 
            this.dirY = 1;
            this._draw();
        }
    }
    // left a
    if (65 in this.keysDown) { 
        walkable = this.game.calculateBoardCollissions(this.x - delta, this.y, this);
        if (walkable.upleft && walkable.downleft) {
            this._erase();
            this.x -= delta;
            this.dirX = -1;
            this._draw();
        }
    }
    // right d
    if (68 in this.keysDown) { 
        walkable = this.game.calculateBoardCollissions(this.x + delta, this.y, this);
        if (walkable.upright && walkable.downright) {
            this._erase();
            this.x += delta;
            this.dirX = 1;
            this._draw();
        }
    }
    
    // update my bullets 
    var dead = [];
    var index = 0;
    for (var i = 0; i < this.bullets.length; i++) {
        if (!this.bullets[i].update(modifier)) {
            dead[index] = i;
            index++;
        }
    }
    for (var j = 0; j < dead.length; j++) {
        console.log(dead);
        this.bullets.splice(dead[j], 1);
        console.log(this.bullets);
    }
    
}

Hero.prototype._erase = function() {
    this.ctx.clearRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

Hero.prototype._draw = function() {
    this.ctx.fillStyle = '#800';
    this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

Hero.prototype.keyDown = function(e) {
    var key = e.keyCode;
    this.keysDown[key] = true;

    if (this.bullets.length >= this.maxBullets)   return;
    if ( (key < 37) || (key > 40) ) return;

    var bullet = new Bullet(this);
    switch (key) {
         // left
        case 37:
            bullet.dirY = 0;
            bullet.dirX = -1;
        break;

        // up
        case 38:
            bullet.dirY = -1;
            bullet.dirX = 0;
        break;

        // right
        case 39:
            bullet.dirY = 0;
            bullet.dirX = 1;
        break;

        // down
        case 40:
            bullet.dirY = 1;
            bullet.dirX = 0;
        break;
    }
    this.bullets[this.bullets.length] = bullet; 
}

Hero.prototype.keyUp = function(e) {
    var key = e.keyCode;
    delete this.keysDown[key];
}

/********************
 *
 * Enemy Class
 * 
 */

function Enemy(mapCanvas) {
}


/********************
 *
 * Game Class
 * 
 */

function Game() {
    this.bgcolor = '#eee';
    this.squareSize = 20;

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
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    this.tiles = [];

    this.mapWidth = this.map[0].length;
    this.mapHeight = this.map.length;

    document.body.style['background'] = '#ccc';
    
    // canvas
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style['position'] = 'absolute';
    this.canvas.style['left'] = '10%';
    this.canvas.style['background'] = this.bgcolor;
    this.canvas.style['border'] = "1px solid #333";
    this.canvas.width = this.mapWidth * this.squareSize; 
    this.canvas.height = this.mapHeight * this.squareSize; 
    this.ctx = this.canvas.getContext("2d");
    
    this.keysDown = {}
    var self = this;
    document.addEventListener('keydown', function(e) {self.keyDown.call(self, e)}, false );
    document.addEventListener('keyup', function(e) {self.keyUp.call(self, e)}, false );
    
    this.buildMap(); 
    
    var heroCanvas = this.canvas.cloneNode(false);
    heroCanvas.style['background'] = 'none';
    document.body.appendChild(heroCanvas);

    this.hero = new Hero(heroCanvas, this);
    
    this._then = Date.now();
    //setInterval(this.mainLoop.bind(this), 10)

    window.requestAnimFrame(this.mainLoop.bind(this));
}

Game.prototype.calculateBoardCollissions = function(x, y, obj) {
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
    this.hero.update(modifier);
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

Game.prototype.drawSquare = function(x, y, fillStyle) {
    var dimX = x * this.squareSize;
    var dimY = y * this.squareSize;
    this.ctx.fillStyle = fillStyle;
    this.ctx.rect(dimX, dimY, this.squareSize, this.squareSize);
    this.ctx.fillRect(dimX + 1, dimY + 1, this.squareSize - 1, this.squareSize - 1);
}


var game = new Game();
}();
