/*
La griglia di tetris e' 10x22 (le ultime 2 delle 22 non sono visibili)
*/

/**********************
 * Piece Class
 */
function Piece() {
    this._p1 = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ];
    this._p2 = [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ];
    this._p3 = [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]
    ];
    this._p4 = [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ];
    this._p5 = [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ];
    this._p6 = [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ];
    this._p7 = [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    this._pieces = [this._p1, this._p2, this._p3, this._p4, this._p5, this._p6, this._p7];
    this._colors = ['#800', '#080', '#008', '#880', '#808', '#088', '#555'];

    var index = Math.floor(Math.random() * this._pieces.length);

    this.color = this._colors[index];
    // piace matrix
    this.matrix = this._pieces[index];
    // row coord of the top left matrix border on game board
    this.row = -1;
    this.col = 3; 
}

function Sound() {
    this.map = {};
    
    var backtrack = document.createElement('audio');
    backtrack.loop = true;
    backtrack.volume = 0.5;
    this.map['backtrack'] = {'file':'snd/tetris.wav', 'elem': backtrack};

    var pop = document.createElement('audio');
    this.map['pop'] = {'file':'snd/pop.wav', 'elem': pop};
    
    var clear = document.createElement('audio');
    this.map['clear'] = {'file':'snd/clear.wav', 'elem': clear};

    var rotate = document.createElement('audio');
    this.map['rotate'] = {'file':'snd/rotate.wav', 'elem': rotate};


}
Sound.prototype.play = function(sound) {
    this.map[sound].elem.src = this.map[sound].file;
    this.map[sound].elem.play();
}

Sound.prototype.stop = function(sound) {
    this.map[sound].elem.src = "";
}

/**********************
 * Game Class
 */
function Game() {
    this.squareSize = 30;
    this.boardColumns = 10;
    this.boardRows = 20;
    this.basetimer = 1500;
    this.timePerLevel = 135;
    this.bgcolor = '#eee';
    
    this.points = 0;
    this.level = 1;
    this.rowsCounter = 0;
   
    this.boardMatrix = Array(); 
    // build board matrix
    for (var x = 0; x < this.boardRows; x++) {
        this.boardMatrix[x] = new Array();
        for (var y = 0; y < this.boardColumns; y++) {
            this.boardMatrix[x][y] = {'value': 0, 'color': this.bgcolor};
        }
    }
    document.body.style['background'] = '#ccc';

    this.sound = new Sound();

    // canvas
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style['position'] = 'absolute';
    this.canvas.style['left'] = '30%';
    this.canvas.style['background'] = this.bgcolor;
    this.canvas.style['border'] = "1px solid #333";
    this.canvas.style.marginLeft = "-"+(this.squareSize * this.boardColumns / 2);
    this.canvas.width = this.squareSize * this.boardColumns;
    this.canvas.height = this.squareSize * this.boardRows;

    var container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '45%';
    container.style.fontSize = '140%';
    container.style.fontFamily= 'arial';

    var div = document.createElement('div');
    div.innerHTML = "<label>Punteggio</label><div id='points'>0</div>";
    div.style.marginBottom = '40%';
    container.appendChild(div);

    var div = document.createElement('div');
    div.innerHTML = "<label>Livello</label><div id='level'>1</div>";
    div.style.marginBottom = '40%';
    container.appendChild(div);

    var div = document.createElement('div');
    div.innerHTML = "<label>Righe</label><div id='rows'>0</div>";
    div.style.marginBottom = '40%';
    container.appendChild(div);

    var button = document.createElement('button');
    button.innerHTML = "Start!";
    button.onclick = this.start.bind(this);
    button.style.fontSize = '150%';
    container.appendChild(button);
    this.startButton = button;


    document.body.appendChild(container);


    this.ctx = this.canvas.getContext("2d");

    document.onkeydown = this.keyEvent.bind(this);;
    this.currentPiece = null;
    this.timer = null;
}

Game.prototype.start = function() {
    this.newPiece();
    this.timer = setInterval(this.timeTick.bind(this), this.basetimer);
    this.startButton.style.display = 'none';
    this.sound.play('backtrack');
}

Game.prototype.timeTick = function() {
    if (!this.goDown()) {
        this.sound.play('pop');
        this.dropLines()
        delete this.currentPiece;
        this.newPiece();
    }
}

Game.prototype.dropLines = function() {
    // list of completed rows id
    var cRows = Array();
    var completedCount = 0;
    for (var x = 0; x < this.boardRows; x++) {
        cRows[x] = true;
        for (var y = 0; y < this.boardColumns; y++) {
            if (this.boardMatrix[x][y].value == 0) {
                cRows[x] = false;
            }
        }
        if (cRows[x]) { 
            completedCount++;
        }
    }
    
    if (completedCount > 0) { 
        this.sound.play('clear');
        this.points += completedCount * this.level;
        this.rowsCounter += completedCount;
        
        var tmp = Math.floor(this.rowsCounter / 10);
        if ( tmp && (tmp <= 10) && (tmp != this.level) ) {
            console.log('level up!');
            this.level = tmp;
            clearInterval(this.timer);
            this.timer = setInterval(this.timeTick.bind(this), this.basetimer - this.level * this.timePerLevel); 
        }
        var newMatrix = Array(); 
        for (var i = 0; i < completedCount; i++) {
            newMatrix[i] = Array();
            for (var y = 0; y < this.boardColumns; y++) {
                newMatrix[i][y] = new Object();
                newMatrix[i][y].value = 0;
                newMatrix[i][y].color = this.bgcolor;
            }
        }
        var copyIndex = completedCount;
        for (var x = 0; x < this.boardRows; x++) {
            if (cRows[x]) {
                continue;
            }
            newMatrix[copyIndex] = Array();
            for (var y = 0; y < this.boardColumns; y++) {
                newMatrix[copyIndex][y] = this.boardMatrix[x][y];
            }
            copyIndex++;
        }
        this.boardMatrix = newMatrix;
        this.refreshScreen();
    }

}

Game.prototype.refreshScreen = function() {
    document.getElementById('points').innerHTML = this.points;
    document.getElementById('rows').innerHTML = this.rowsCounter;
    document.getElementById('level').innerHTML = this.level;
    for (var x = 0; x < this.boardRows; x++) {
        for (var y = 0; y < this.boardColumns; y++) {
            this.drawSquare(y, x, this.boardMatrix[x][y].color);
        }
    }
}

Game.prototype.newPiece = function() {
    this.currentPiece = new Piece();
    if (this.collide(this.currentPiece.matrix, this.currentPiece.row, this.currentPiece.col)) {
        console.log("game over");
        this.startButton.style.display = 'block';
        this.sound.stop('backtrack');
        clearInterval(this.timer);
    }
    this.drawPiece();
}

/* check if piece collide with board matrix */
Game.prototype.collide = function(matrix, pRow, pCol) {
    var start = 0;
    // just created piece
    if (pRow < 0) {
        start = pRow * -1;
    }
    for(var row = start; row < 4; row++) {
        for(var col = 0; col < 4; col++) {
            if (matrix[row][col] == 1) {
                if ( (col + pCol) < 0) {
                    //console.log("collision left");
                    return true;
                }
                if ( (col + pCol) >= this.boardColumns) { 
                    //console.log("collision right");
                    return true;
                }
                if ( (row + pRow) >= this.boardRows ) {
                    //console.log("collision down");
                    return true;
                }
                // matrix filled
                if (this.boardMatrix[pRow+row][pCol+col].value == 1) {
                    //console.log("matrix collision");
                    return true;
                }
            }
        }
    }
    return false;
}

Game.prototype.drawSquare = function(x, y, fillStyle) {
    var dimX = x * this.squareSize;
    var dimY = y * this.squareSize;
    this.ctx.fillStyle = fillStyle;
    this.ctx.rect(dimX, dimY, this.squareSize, this.squareSize);
    this.ctx.fillRect(dimX + 1, dimY + 1, this.squareSize - 1, this.squareSize - 1);
}

Game.prototype.drawPiece = function() {
    var piece = this.currentPiece;
    var m = piece.matrix;
    for(var x = 0; x < 4; x++) {
        for(var y = 0; y < 4; y++) {
            if (m[x][y] == 1) {
                this.drawSquare(y + piece.col, x + piece.row, piece.color);
            }
        }
    }
}
Game.prototype.erasePiece = function() {
    var piece = this.currentPiece;
    var m = piece.matrix;
    for(var x = 0; x < 4; x++) {
        for(var y = 0; y < 4; y++) {
            if (m[x][y] == 1) {
                this.drawSquare(y + piece.col, x + piece.row, this.bgcolor);
            }
        }
    }
}
Game.prototype.deatachPiece = function() {
    var m = this.currentPiece.matrix;

    // remove piece from board matrix
    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            if (m[x][y] == 1) {
                if (x+this.currentPiece.row >= 0) {
                    this.boardMatrix[x+this.currentPiece.row][y+this.currentPiece.col].value = 0;
                    this.boardMatrix[x+this.currentPiece.row][y+this.currentPiece.col].color = this.bgcolor;
                }
            }
        }
    }
}

Game.prototype.attachPiece = function() {
    var m = this.currentPiece.matrix;

    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            if (m[x][y] == 1) {
                if (x+this.currentPiece.row >= 0) {
                    this.boardMatrix[x+this.currentPiece.row][y+this.currentPiece.col].value = 1;
                    this.boardMatrix[x+this.currentPiece.row][y+this.currentPiece.col].color = this.currentPiece.color;
                }
            }
        }
    }
}

/* 
 * Try to move this.currentPiece to the new piece position
 */ 
Game.prototype.movePiece = function(nRow, nCol) {
    this.deatachPiece();

    var collisionDetected = this.collide(this.currentPiece.matrix, nRow, nCol);
    if (!collisionDetected) {
        this.erasePiece();
        // update piece coords
        this.currentPiece.col = nCol;
        this.currentPiece.row = nRow;
    }

    // reattach piece to matrix (eventually using new coords)
    this.attachPiece();
    
    if (!collisionDetected) this.drawPiece();
    return collisionDetected;
}

Game.prototype.rotatePiece = function() {
    this.deatachPiece();

    var copy = Array();
    for (var i = 0; i < 4; i++) {
        copy[i] = Array();
    }
    var matrix = this.currentPiece.matrix;
    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            //copy[y][3 - x] = matrix[x][y];
            copy[3 - y][x] = matrix[x][y];
        }
    }
    var collisionDetected = this.collide(copy, this.currentPiece.row, this.currentPiece.col);
    if (!collisionDetected) {
        this.sound.play('rotate');
        this.erasePiece();
        this.currentPiece.matrix = copy;
    }
    
    this.attachPiece();

    if (!collisionDetected) this.drawPiece();
}

Game.prototype.moveRight = function() {
    this.movePiece(this.currentPiece.row, this.currentPiece.col + 1);
}

Game.prototype.moveLeft = function() {
    this.movePiece(this.currentPiece.row, this.currentPiece.col - 1);
}

Game.prototype.goDown = function() {
    return !this.movePiece(this.currentPiece.row + 1, this.currentPiece.col);
}

Game.prototype.fall = function() {
    while (this.goDown()) {}
}

Game.prototype.keyEvent = function(e) {
    var key = e.keyCode;
    switch (key) {
        // freccia su
        case 38:
            this.rotatePiece();
        break;
        // freccia sinistra
        case 37: 
            this.moveLeft();
        break;

        // freccia a destra
        case 39: 
            this.moveRight();
        break;

        // freccia giu'
        case 40:
            this.goDown();
        break;

        // barra spaziatrice
        case 32:
            this.fall();
        break;
    }
    e.stopPropagation();
}



/**********************/
var game = new Game();
//game.start();


