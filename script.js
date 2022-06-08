// load event wait for all assets like spritesheets or images to be fully loaded before executing code in it's anonymous callback function
// the entire code of the game is placed inside this anonymous callback function to seperate scope of our game from a global scope to make sure custom class and variable names don't clash with any other outside code
// anonymous function = function without a name
window.addEventListener('load', function(){
    // executed line by line after all assets are fully loaded
    // variable for the canvas element
    const canvas = document.getElementById('canvas1');
    // ctx = context, instance of built-in canvas2D api that holds all drawing methods and properties needed to animate our game
    const ctx = canvas.getContext('2d');
    // set canvas width to 1300px and canvas height to 720px
    canvas.width = 1400;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    const fullScreenButton = document.getElementById('fullScreenButton');

    // apply eventlisteners to keyboard events and hold an array of all currently active keys
    class InputHandler{
        constructor(){
            // create this.keys property and set it equal to an empty array to add / remove keys when pressed(to keep track of multiple key presses)
            this.keys = [];
            // to store the initial starting vertical coordinate
            this.touchY = '';
            // for the starting and ending touchpoints to be at least 30px apart from each other to trigger an event
            this.touchTreshold = 30;
            /* Eventlistener testen(with the instance: const input = new InputHandler()) and get event properties(like key property)
            window.addEventListener('keydown', function(e) {
                console.log(e);
            });*/
            // place an eventlistener directly inside of the constructor, so when an instance of the class is created, all eventlisteners will be automatically applied
            // eventlistener if key is pressed(?)
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' || 
                     e.key === 'ArrowUp' || 
                     e.key === 'ArrowLeft' || 
                     e.key === 'ArrowRight')  
                    // this.keys.indexOf(e.key) === -1 means element not present in the array(keys)           
                    && this.keys.indexOf(e.key) === -1){
                    // push that key in the array(keys)
                    this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) restartGame();
                //console.log(e.key, this.keys);
            });
            // eventlistener if key is not pressed / released(?)
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' || 
                    e.key === 'ArrowUp' || 
                    e.key === 'ArrowLeft' || 
                    e.key === 'ArrowRight'){
                    // this.keys.slice(this.keys.indexOr(e.key), 1) means remove 1 element at the index from the array(keys)
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
                //console.log(e.key, this.keys);
            });
            window.addEventListener('touchstart', e => {
                //console.log(e.changedTouches[0].pageY);
                this.touchY = e.changedTouches[0].pageY;
            })
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (swipeDistance < -this.touchTreshold && this.keys.indexOf('swipe up') === -1) this.keys.push('swipe up')
                else if (swipeDistance > this.touchTreshold && this.keys.indexOf('swipe down') === -1) {
                    this.keys.push('swipe down');
                    if (gameOver) restartGame();
                }
                //console.log(e.changedTouches[0].pageY);
                //console.log(e);
            })
            window.addEventListener('touchend', e => {
                //console.log(this.keys);
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
                //console.log(e.changedTouches[0].pageY);
            })
        }
    }

    // React to the active keys(as they are being pressed), drawing and updating the player
    class Player{
        //gameWidth and gameHeight represent the gameboundaries
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            // bring image spritesheet into the game
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            // the image spritesheet of the player has 8 horizontal frame
            this.maxFrame = 8;
            this.frameY = 0;
            // fps variable to set frame per second
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            // set the player's velocity y(vy) property to 0
            this.vy = 0; 
            // set the weight or gravity property
            this.weight = 1;
        }

        // method to restart player to it's initial position
        restart(){
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }

        // create a draw method, which expects context as an argument to specify which canvas we want to draw on(in case we want multiple layers / canvas in our game)
        draw(context){
            // code to display collision area
            // collision - shows the rectangle collision area / border of the player
            /*context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw circular hit box
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();

            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();*/

            // fillStyle to set the background of the context to white for more visibility
            //context.fillStyle = 'white';
            
            //fillRect method draws rectangle representing our player to pass x, y coordinates and width, height of the player
            //context.fillRect(this.x, this.y, this.width, this.height);
            
            //pass the image to the drawImage method, then sx=source x, sy=source y, sw=source width, sh=source height, then pass x and y of 0, 0, and additional width and height arguments
            // context.drawImage(this.image, this.x, this.y) to draw the entire large spritesheet with all the frames
            // context.drawImage(this.image, this.x, this.y, this.width, this.height) to stretch or shrink the image to fill all available area
            // context.drawImage(this.image, sx(this.frameX * this.width), sy(this.frameY * this.height), sw(this.width), sh(this.height), this.x, this.y, this.width, this.height) to define the rectangles we crop out from the spritesheet and draw a single frame and in which destination canvas the cropped out rectangle will be placed
            // sx, sy helps to jump between different rows or columns of the spritesheet
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        // update coordinate by one after every call on the update method
        update(input, deltaTime, enemies){
            // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2 - 20) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2 + 20);
                // calculate the distance with the pythagorus theorem
                const distance = Math.sqrt(dx * dx + dy * dy);//hypothenuse = racine carrée de x^2 + y^2
                if (distance < enemy.width / 3 + this.width / 3){
                    // if we have collision, set gameOver to true
                    gameOver = true;
                } 
            });

            // sprite animation
            if (this.frameTimer > this.frameInterval){
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
            
            // controls
            if (this.frameX >= this.maxFrame){

            }
            // if ArrowRight is pressed
            if (input.keys.indexOf('ArrowRight') > -1){
                // set player's speed to 5
                this.speed = 5;
            } 
            // If ArrowRight is pressed
            else if(input.keys.indexOf('ArrowLeft') > -1) {
                // set player's speed to -5
                this.speed = -5;
            }
            // If ArrowUp is pressed
            else if((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.vy -= 32;
            }
            // else set the player's speed to 0
            else{
                this.speed = 0;
            }

            // horizontal movement
            // horizontal boundaries - if horizontal's x-coordinate is less than 0, set it back to 0
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            // else if player's horizontal coordinate is more than gameWidth minus player's width, set it to gamewidth minus player's width to stop it from going over the right edge of the game
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width

            // vertical movement
            this.y += this.vy;
            // if this.onGround is false(!(this.onGround())) means, it's still in the air
            if (!this.onGround()){
                // gradually increase the weight
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else{
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if(this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

        // method which returns true if the player's y-coordinate is more or equal to the gameheight minus player's height to know if player stands on solid ground, otherwise returns false
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    // Class to handle endless scrolling background
    class Background{
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 20;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update(){
            // update background's horizontal coordinate with the speed variable 
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
        restart(){
            this.x = 0;
        }
    }

    // Class to generate enemies in the game
    class Enemy{
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth - 100;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            // fps variable to set frame per second
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedForDeletion = false;
        }
        draw(context){
            // code to display collision area
            // collision - shows the collision / border area of the enemy
            /*context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw circular hit box
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();

            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();*/

            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);            
        }
        update(deltaTime){
            if(this.frameTimer > this.frameInterval){
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }
    
    // function to add, animate, remove enemies from the game
    function handleEnemies(deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval){
            // push instance of Enemy class in enemies array, and pass canvas' width and height from it's constructor
            enemies.push(new Enemy(canvas.width, canvas.height))
            //console.log(enemies);
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else{
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    // function to display score or gameover message
    function displayStatusText(context){
        context.textAlign = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);
        // If gameOver is true
        if(gameOver){
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, press Enter or swipe down to restart!', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, press Enter or swipe down to restart!', canvas.width / 2 + 2, 202);
        }
    }

    // function to restart the game
    function restartGame(){
        //restart the player to it's initial position
        player.restart();
        //restart background to it's initial position
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullScreen(){
        console.log(document.fullscreenElement);
        if (!document.fullscreenElement) {
            //requestFullscreen is an asynchronous method which returns a promise
            canvas.requestFullscreen().catch(err => {
                alert(`Error, can't enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    fullScreenButton.addEventListener('click', toggleFullScreen);

    // create an instance of InputHandler-class
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    // random number between 500 and 1500 milisecond
    let randomEnemyInterval = Math.random() * 1000 + 500;
    
    // function for the main animation loop, runs 60times per second, updating and drawing our game over and over
    function animate(timeStamp){
        // deltaTime = how many miliseconds our computer need to serve one animation frame(60frames per second = 60miliseconds)
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // console.log(deltaTime);
        // delete entire canvas between each animation loop to see only the current animation frame
        ctx.clearRect(0,0,canvas.width, canvas.height);
        // display the background
        background.draw(ctx);
        background.update();
        //display the player thanks to the Player's class draw method, which expects a context as an argument(ctx = canvas.getContext('2d'))
        player.draw(ctx);
        player.update(input, deltaTime, enemies);

        handleEnemies(deltaTime);
        displayStatusText(ctx);
        // to create endless animation loop
        if (!gameOver) requestAnimationFrame(animate);
    }

    animate(0);
});

