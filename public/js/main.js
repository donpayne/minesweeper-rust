/*
                     --------------------------------------------------------------------
                                      MINESWEEPER IN PURE JAVASCRIPT
                     --------------------------------------------------------------------
*/

(function(){
  var Game = (function(){

     // for ease of access!
    var components = {
      clock: document.getElementById('js-clock'),
      smiley: document.getElementById('js-play-mood'),
      menu: document.getElementById('js-options'),
      board: document.getElementById('js-game-board'),
      noOfMines: document.getElementById('js-no-of-mines'),
      gameOptions: document.getElementById('game-options'),
      isGameOver: false,
      isTimeOut: false,
      isFirstTile: true,
      images: {
        sad: "images/sad.png",
        smile: "images/smile.png",
        cool: "images/cool.png"
      }
    };

    // holds the data of the application.
    var model = {
      config: {
        rows: 9,
        cols: 9,
        mines: 10,
        tiles: [],
        setConfig: function(rows, cols, mines){
          this.rows = rows;
          this.cols = cols;
          this.mines = mines;
        }
      },
      tile: { // properties of each tile
        isFlagged: false,
        isOpened: false,
        hasMine: false,
        count: 0
      }
    };

    // User Interface
    var views = {

      // handles the actual logic of Game Menu hide/show mechanism
      menuToggle: function(){
        components.menu.classList.toggle("hidden");
      },

      generateBoard: function(){
        var rows = model.config.rows;
        var cols = model.config.cols;
        var mines = model.config.mines;
        var html= "",td, id =0;

        for(var i=0; i<rows; i++){
          html += '<tr>';
          for(var j=0; j<cols; j++){
            td = '<td class="tile" id="{id}"></td>';
            html += td.replace("{id}", id);
            id++;
          }
          html += '</tr>';
        }
        components.board.innerHTML = html;
        components.noOfMines.innerHTML = mines;
      },

      setSmiley: function(mood){
        if(mood === 'sad'){
          components.smiley.setAttribute("src", components.images.sad);
        }
        else if(mood === 'smile'){
          components.smiley.setAttribute("src", components.images.smile);
        }
        else if(mood === 'cool'){
          components.smiley.setAttribute("src", components.images.cool);
        }
      },

    };

    // handles all the interactions/events - updates the model/views accordingly.
    var controller = {

      handleMenuToggle: function(){
        components.gameOptions.addEventListener('click', function(){
          views.menuToggle();
        });
      },

      selectDifficulty: function(){
        var beginner = document.getElementById('beginner');
        var intermediate = document.getElementById('intermediate');
        var expert = document.getElementById('expert');
        if(beginner.checked){
          model.config.setConfig(9,9,10);
        }
        else if(intermediate.checked){
          model.config.setConfig(16,16,40);
        }
        else if(expert.checked){
          model.config.setConfig(16,30,99);
        }
      },

      newGameInit: function(){
        var newGame = document.getElementById('js-new-game');
        newGame.addEventListener('click', function(){
          controller.selectDifficulty(); // On newGame - Select difficulty level and generate the game board.
          views.generateBoard(); // generates board with the chosen difficulty.
          views.menuToggle(); // hide Menu after the new Game has been initialized.
          controller.tileProp(); // sets properties to the tiles of newly generated board.
        });
      },

      // adds MODEL.TILE's properties(isOpened, hasMine, etc) to individual tile.
      tileProp: function(){
        // ensures that tiles are pushed to an empty array on every reset.
        model.config.tiles.length = 0;
        var tds = document.getElementsByClassName('tile');

        for(var i = 0; i < tds.length; i++){
          var eachTile = Object.create(model.tile); // model.tile is now a prototype of eachTile. Crockford \m/s
          eachTile.td = tds[i]; // associates tile with properties!
          model.config.tiles.push(eachTile);
        }
      },

      handleMouseEvents: function(){
        // disables Right Click (Context Menu) on the board so that the Flagging should work on right click.
        components.board.addEventListener('contextmenu', function(e){
          e.preventDefault();
        });

        // finds target element through Event Delegation, i.e finds the clicked tile.
        components.board.addEventListener('mouseup', function(e){
          if(e.target && e.target.nodeName === 'TD'){
            var tileId = parseInt(e.target.id, 10);
            var tile = document.getElementById(tileId);

            // if it's right Click --- DO THE FLAGGING!
            if(e.button === 2){
              console.log("Hello, Right Click");
              if(model.config.tiles[tileId].isOpened === false){
                controller.doFlagging(tileId);
              }
            }
            else{
              controller.playGame(tileId);
            }
          }
        });
      },

      playGame: function(tileId){
        // if it's the first click of the game, initialize it - start timer, generate mines, and calculate values!
        if(components.isFirstTile === true){
          controller.timer();
          controller.plantMines(tileId);
          controller.calculateValuesAroundMines();
          components.isFirstTile = false;
        }
        else if(controller.hasClickedMine(tileId)){
          views.setSmiley("sad");
          clearInterval(time);

          //Show all the mines which are not flagged!
          for(var i = 0; i < model.config.tiles.length; i++){
            if(model.config.tiles[i].hasMine === true & model.config.tiles[i].isFlagged === false){
              model.config.tiles[i].td.classList.add("mines");
            }
          }
        }
        else if(controller.hasWon()){
          console.log("Yesss! I'mma cool dude!");
        }

        controller.revealTiles(tileId);
      },

      timer: function(){
        var counter = 0;
        time = setInterval(function(){
          if(counter < 999){
            counter++;
            components.clock.innerHTML = counter;
          }
          else {
            clearInterval(time);
            views.setSmiley("sad");
            components.isTimeOut = true;
            components.isGameOver = true;
          }
        }, 1000);
      },

      // Do not plant a mine at the position of the first Click!
      plantMines: function(tileId){
        var random, k;
        var rows = model.config.rows;
        var cols  = model.config.cols;
        var tiles = model.config.tiles;
        for(k = 0; k < model.config.mines; k++){
          random = Math.floor(Math.random() * ((rows*cols)-1));
          if(random === tileId || tiles[random].hasMine === true){
            console.log("Either the mine has already been planted here, or it's the id of first clicked tile");
            k--;
          }
          else{
            tiles[random].hasMine = true;
            console.log(random);
          }
        }
        console.log("Alert! Mines have been planted, play carefully now.");
      },

      hasClickedMine: function(tileId){
        if(model.config.tiles[tileId].hasMine === true && model.config.tiles[tileId].isFlagged === false){
          console.log("You clicked on mine, dude!");
          return true;
        }
      },

      doFlagging: function(tileId){
        var minesElement = components.noOfMines;
        var mineValue = parseInt(minesElement.innerHTML, 10);
        var tile = model.config.tiles[tileId];
        if(tile.isFlagged === false){
          if(mineValue > 0){
            tile.td.classList.add("flagged");
            tile.isFlagged = true;
            mineValue--;
            minesElement.innerHTML = mineValue;
          }
        }
        else if(mineValue < model.config.mines){
          tile.isFlagged = false;
          tile.td.classList.remove("flagged");
          mineValue++;
          minesElement.innerHTML = mineValue;
        }
      },

      calculateValuesAroundMines: function(){
        var tiles = model.config.tiles;
        var cols = model.config.cols;
        var i, mine, top, bottom;
        for(i = 0; i < tiles.length; i++){
          if(tiles[i].hasMine === true){

            // increment left tile count by 1 if it's not a mine
            if(tiles[i-1] && tiles[i-1].td !== null && tiles[i-1].hasMine === false){
              tiles[i-1].count += 1;
              console.log(tiles[i-1].count);
            }
            // increment right tile count by 1 if it's not a mine
            if(tiles[i+1] && tiles[i+1].td !== null && tiles[i+1].hasMine === false){
              tiles[i+1].count += 1;
              console.log(tiles[i+1].count);
            }

            // increment count of tile top-left, top, top-right by 1
            if(tiles[i].td.parentNode.previousElementSibling !== null){
              top = i - cols;
              // increment top tile count by 1
              if(tiles[top].hasMine === false){
                tiles[top].count += 1;
              }
              //increment top-left tile count by 1
              if(tiles[top-1] && tiles[top-1].td !== null && tiles[top-1].hasMine === false){
                tiles[top-1].count += 1;
              }
              // increment top-right tile count by 1
              if(tiles[top+1] && tiles[top+1].td !== null && tiles[top+1].hasMine === false){
                tiles[top+1].count += 1;
              }
            }

            // increment bottom, bottom-left and bottom-right tiles count
            if(tiles[i].td.parentNode.nextElementSibling !== null){
              bottom = i + cols;

              // increment bottom tile count by 1
              if(tiles[bottom].hasMine === false){
                tiles[bottom].count += 1;
              }
              //increment bottom-left tile count by 1
              if(tiles[bottom-1] && tiles[bottom-1].td !== null && tiles[bottom-1].hasMine === false){
                tiles[bottom-1].count += 1;
              }
              // increment bottom-right tile count by 1
              if(tiles[bottom+1] && tiles[bottom+1].td !== null && tiles[bottom+1].hasMine === false){
                tiles[bottom+1].count += 1;
              }
            }
          }
        }
      },

      hasWon: function(){
        return false;
      },

      // FLOOD FILL ALGORITHM --- Recursion!
      // reveal tiles till you find the boundary of the numbers
      revealTiles: function(tileId){
        var tiles = model.config.tiles;
        var tile = tiles[tileId];
        var cols = model.config.cols;
        if(tile.isOpened === false && tile.hasMine === false){
          tile.isOpened = true;
          tile.td.classList.add("opened-tile");
          var count = tile.count;
          if(count === 0){

            // since the clicked tile has zero count,
            // let's check all its surrounding tiles
            // and reveal them if they have zero counts too, or
            // reveal RECURSIVELY till you find the boundary of the numbers i.e greater than 0

            // let's check for LEFT of CLICKED TILE
            if(tiles[tileId-1] && tiles[tileId-1].hasMine === false){
              controller.revealTiles(tileId-1);
            }
            // let's check for RIGHT of CLICKED TILE
            if(tiles[tileId+1] && tiles[tileId+1].hasMine === false){
              controller.revealTiles(tileId+1);
            }
            // let's check for TOP, TOP-LEFT, TOP-RIGHT
            if(tiles[tileId].td.parentNode.previousElementSibling !== null){
              var top = tileId - cols;

              // TOP
              if(tiles[top].hasMine === false){
                controller.revealTiles(top);
              }
              // TOP-LEFT
              if(tiles[top-1] && tiles[top-1].hasMine === false){
                controller.revealTiles(top-1);
              }
              // TOP-RIGHT
              if(tiles[top+1] && tiles[top+1].hasMine === false){
                controller.revealTiles(top+1);
              }
            }
            // Let's check for BOTTOM, BOTTOM-LEFT, BOTTOM-RIGHT
            if(tiles[tileId].td.parentNode.nextElementSibling !== null){
              var bottom = tileId + cols;

              // BOTTOM
              if(tiles[bottom].hasMine === false){
                controller.revealTiles(bottom);
              }
              // BOTTOM-LEFT
              if(tiles[bottom-1] && tiles[bottom-1].hasMine === false){
                controller.revealTiles(bottom-1);
              }
              // BOTTOM-RIGHT
              if(tiles[bottom+1] && tiles[bottom+1].hasMine === false){
                controller.revealTiles(bottom+1);
              }
            }
          }
          else {
            tile.td.innerHTML = count;
          }
        }
      }
    };

    return{
      init: function(){
        views.generateBoard();
        controller.handleMenuToggle();
        controller.newGameInit();
        controller.tileProp();
        controller.handleMouseEvents();
      }
    };
  })();
  Game.init();
}());
