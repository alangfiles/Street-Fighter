var game = new Phaser.Game(600, 224, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update });

function preload(){
  game.load.image('hadouken', 'assets/hadouken.png');
//  game.load.image('ryu', 'assets/ryu.png');
  game.load.image('enemy', 'assets/enemy.png');  
  game.load.spritesheet('ryu', 'assets/RyuSpriteMap125x135.png',125,135);
    game.load.image('background', 'assets/levels/sf2hf-ryu.gif');
    
    hadoukenKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    shoryukenKey = game.input.keyboard.addKey(Phaser.Keyboard.C);
}

var ryu, enemy, hadouken, cursor, moveTimer=0, jumpTimer=0, shoryukenActiveTime=0, enemyTime=0;
var MAX_HADOUKENS = 2, HADOUKEN_TIME_LIMIT = 500, SHORYUKEN_ATTACK_TIME=1000, JUMP_TIME_LIMIT = 2000, GRAVITY_CONST = 300, MAX_ENEMIES=1, TIME_BETWEEN_ENEMIES=3000;
var numberHadoukens = 0, numberEnemies=0;
var ryuAnim;

function create(){ 
    
  background = game.add.tileSprite(0, 0, 657, 224, "background");
    
  game.physics.startSystem(Phaser.Physics.ARCADE);
  ryu = game.add.sprite(10,200, 'ryu', 1);
  game.physics.arcade.enable(ryu);
  ryu.body.collideWorldBounds = true;
  ryu.body.gravity.y = GRAVITY_CONST;
    ryu.body.width=70;
    ryu.body.height=150;
    
  enemy = game.add.sprite(500, 200, 'enemy');    
  game.physics.arcade.enable(enemy);
  enemy.body.collideWorldBounds = true;
  enemy.body.gravity.y = GRAVITY_CONST;
  enemy.body.height=122;
  numberEnemies++;
  enemyTime = game.time.now;
    
  ryu.animations.add('stand', [0,1,2,3,4,5], 8, true, true);
  ryu.animations.add('backwards', [6,7,8,9,10,11], 8, true, true);
  ryu.animations.add('forwards', [12,13,14,15,16,17], 8, true, true);
  ryu.animations.add('jump', [18,19,20,21,22,23], 8, true, true);
  ryu.animations.add('shoryuken', [24,25,26,27,28,29], 8, true, true);
  ryu.animations.add('hadouken', [30,31,32,33,34,35], 8, true, true);
  ryu.animations.play('stand', 8, true);
  cursor = game.input.keyboard.createCursorKeys();

}
    
function update(){
    enemy.body.velocity.x = -50;
    
    checkRyuMotion();
    checkFireBall();
    checkShoryuken();
    
    addEnemy();

    game.physics.arcade.collide(enemy, ryu, ryuEnemyCollision, null, null);
    game.physics.arcade.collide(hadouken, enemy, hadoukenEnemy, null, null);
    game.physics.arcade.collide(hadouken, game.world.bounds, hadoukenEnemy, null, null);
}

function addEnemy(){
    if(enemyTime + TIME_BETWEEN_ENEMIES < game.time.now
       && numberEnemies < MAX_ENEMIES){
        enemy = game.add.sprite(500, 200, 'enemy');
        game.physics.arcade.enable(enemy);
        enemy.body.collideWorldBounds = true;
        enemy.body.gravity.y = GRAVITY_CONST;
        enemy.body.height=122;
        numberEnemies++;
        enemyTime = game.time.now;
    }
}

function checkRyuMotion(){
    
    if(game.time.now > moveTimer)//you can't move when doing a special move.
    {
        //velocity: x
        if (cursor.right.isDown){
            ryu.body.velocity.x = 80;
            if(ryu.body.onFloor()){
                ryu.animations.play('forwards', 8, true);
            }
        }
        else if(cursor.left.isDown){
            ryu.body.velocity.x = -60;
            if(ryu.body.onFloor()){
                ryu.animations.play('backwards', 8, true);
            }
        }
        else{
            ryu.body.velocity.x = 0;

            if(ryu.body.onFloor()){
                ryu.animations.play('stand', 8, true);
            }
        }

        //velocity: y
        if(cursor.down.isDown){
            //duck
        }
        else if(cursor.up.isDown
               && game.time.now > jumpTimer){
            //jump
            ryu.body.velocity.y = -240;
            ryu.animations.play('jump', 6, true);
            jumpTimer = game.time.now + JUMP_TIME_LIMIT;
        }
    }
    
}

function checkFireBall(){
    if(hadoukenKey.isDown 
       && numberHadoukens < MAX_HADOUKENS
       && game.time.now > moveTimer 
       && ryu.body.onFloor()){ //can only throw hadoukens on the ground
        ryu.animations.play('hadouken', 10, true);
        ryu.body.velocity.x=-10; //a little pushback
        hadouken = game.add.sprite((ryu.body.x + 60), ryu.body.y + 60, 'hadouken');  
        game.physics.arcade.enable(hadouken);
        hadouken.body.velocity.x = 100;
        hadouken.body.collideWorldBounds = true;
        numberHadoukens++;
        moveTimer = game.time.now + HADOUKEN_TIME_LIMIT;
    }
}

function checkShoryuken(){

    if(shoryukenKey.isDown
      && game.time.now > moveTimer 
      && ryu.body.onFloor()){
        if(ryu.body.onFloor()){
            ryu.body.velocity.y = -180;
            ryu.body.velocity.x = 60;
            ryu.animations.play('shoryuken', 6, true);
            moveTimer = game.time.now + HADOUKEN_TIME_LIMIT;
            shoryukenActiveTime = game.time.now + SHORYUKEN_ATTACK_TIME;
        }
    }
    
}

function hadoukenEnemy(){
    enemy.kill();
    numberEnemies--;
    hadouken.kill();
    numberHadoukens--;
}

function ryuEnemyCollision(){
    if(game.time.now < shoryukenActiveTime){ //ryu in shoryuken
        enemy.kill();
        numberEnemies--;
    }
    else{
        gameOver();
    }
}

function gameOver(){
    enemy.kill();
    numberEnemies--;
    ryu.kill();
}