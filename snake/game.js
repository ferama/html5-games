// http://cykod.github.io/Presentations/HTML5/Crafty/

var BOARD_WIDTH = 800;
var BOARD_HEIGHT = 400;
var TILE_SIZE = 20;
var TILES_X_COUNT = BOARD_WIDTH / TILE_SIZE;
var TILES_Y_COUNT = BOARD_HEIGHT / TILE_SIZE;

Crafty.init(BOARD_WIDTH, BOARD_HEIGHT, document.getElementById('game'));
Crafty.canvas.init();
Crafty.background('black');

Crafty.c("Snake", {
    init: function() {
        this.requires('Color, 2D, Canvas, Collision');
        this.bind('EnterFrame', this.onFrameEvent);
        this.bind('KeyDown', this.onKeyDown);
        this.color('#ffffff');
    },
    dirX: 1,
    dirY: 0,
    nextDirX: this.dirX,
    nextDirY: this.dirY,
    speed: 1,
    loopC: 0,
    died: false,
    changingDirection: false,
    onKeyDown: function(e) {
        switch (e.key) {
            case Crafty.keys.A:
                if (!this.changingDirection) {
                    this.changingDirection = true;
                    this.nextDirY = 0;
                    this.nextDirX = -1;
                }
                break;
            case Crafty.keys.W:
                if (!this.changingDirection) {
                    this.changingDirection = true;
                    this.nextDirY = -1;
                    this.nextDirX = 0;
                }
                break;
            case Crafty.keys.D:
                if (!this.changingDirection) {
                    this.changingDirection = true;
                    this.nextDirY = 0;
                    this.nextDirX = 1;
                }
                break;
            case Crafty.keys.S:
                if (!this.changingDirection) {
                    this.changingDirection = true;
                    this.nextDirY = 1;
                    this.nextDirX = 0;
                }
                break;

        }
    },
    timeSplit: 0,
    onFrameEvent: function(dt) {
        if (this.timeSplit < 8) {
            this.timeSplit++;
            return;
        }
        this.timeSplit = 0;
        if (!this.died) {
            if (this.changingDirection) {
                this.changingDirection = false;
                this.dirX = this.nextDirX;
                this.dirY = this.nextDirY;
            }

            // posizione testa snake
            var oldX = this.x;
            var oldY = this.y;
            
            // sposto avanti la testa di una posizione
            this.x += this.dirX * TILE_SIZE * this.speed;
            this.y += this.dirY * TILE_SIZE * this.speed;
            
            // il prossimo pezzo sara' posizionato dove prima c'era la testa
            var nextPieceX = oldX;
            var nextPieceY = oldY;
            for (var i = 0; i < game.snakePieces.length; i++) {
                var piece = game.snakePieces[i];
                piece.hittable = true;
                pieceX = piece.x;
                pieceY = piece.y;
                piece.x = nextPieceX;
                piece.y = nextPieceY;
                nextPieceX = pieceX;
                nextPieceY = pieceY;
            }
        }
    },

});

Crafty.c("Apple", {
    init: function() {
        this.requires('Color, 2D, Canvas, Collision');
        this.color("#aa0000");
        //console.log("new apple");
    }
});

Crafty.c("SnakePiece", {
    init: function() {
        this.requires('Color, 2D, Canvas, Collision');
        this.color("white");
    },
    // un pezzo di snake diventa hittable dopo essere stato mosso
    // almeno una volta. Serve per prevenire che il serpente collida
    // non appena viene aggiunto un pezzo
    hittable: false,
});


window.game = {
    snakePieces: [],
    init: function() {
        var snake = Crafty.e("Snake")
             .attr({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2, w: TILE_SIZE, h: TILE_SIZE})
             .collision();
        
        snake.onHit("Wall", function(hit) {
            this.died = true;
        });
        snake.onHit("SnakePiece", function(hit) {
            if (hit[0].obj.hittable) {
                this.died = true;
            }
        });

        snake.onHit("Apple", function(hit) {
            var point = hit[0].obj;

            hit[0].obj.destroy();
            //console.log("apple eaten");

            var piece = Crafty.e("SnakePiece")
                            .attr({x: point.x, y: point.y, w: TILE_SIZE, h: TILE_SIZE});
            game.snakePieces.push(piece);
            game.generateApple();
            
        });
        
        game.buildWalls();
        game.generateApple();
    },
    generateApple: function() {
        var apple = Crafty.e("Apple")
             .attr({
                 x: Crafty.math.randomInt(1, TILES_X_COUNT - 2) * TILE_SIZE, 
                 y: Crafty.math.randomInt(1, TILES_Y_COUNT - 2) * TILE_SIZE, 
                 w: TILE_SIZE, 
                 h: TILE_SIZE})
    },

    buildWalls: function() {
        // top wall
        Crafty.e("2D, Canvas, Color, Collision, Wall")
            .color("#0000aa")
            .attr({h:TILE_SIZE, w:BOARD_WIDTH, x:0, y:0 })
            .collision();

        // right wall 
        Crafty.e("2D, Canvas, Color, Collision, Wall")
            .color("#0000aa")
            .attr({h:BOARD_HEIGHT, w:TILE_SIZE, x:BOARD_WIDTH - TILE_SIZE, y:0 })
            .collision();
        
        // left wall 
        Crafty.e("2D, Canvas, Color, Collision, Wall")
            .color("#0000aa")
            .attr({h:BOARD_HEIGHT, w:TILE_SIZE, x:0, y:0 })
            .collision();
        
        // bottom wall 
        Crafty.e("2D, Canvas, Color, Collision, Wall")
            .color("#0000aa")
            .attr({h:TILE_SIZE, w:BOARD_WIDTH, x:0, y:BOARD_HEIGHT - TILE_SIZE})
            .collision();
        
    },

}

game.init();
