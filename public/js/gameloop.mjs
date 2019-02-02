/*
Smarty Bird
This is an attempt of making the game tetris using modern programming languages

Copyright (C) 2017  Luiz Eduardo Amaral - <luizamaral306@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import * as screens from './screens.mjs';

// Game Class
export class Game {
  constructor(db) {
    this.db = db;
    this.collection = "highScores";
    this.fps = 30;
    this.width = 320;
    this.height = 480;
    this.speed = 2;
    this.canvasId = "game-box";
    this.sketch = null;
    this.p5 = new p5((sketch) => {
      this.sketch = sketch;
      this.sketch.preload = () => {
        // this.font = this.sketch.loadFont("/assets/FlappyBirdy.ttf");
        this.font = this.sketch.loadFont("/assets/pixelmix.ttf");
        this.fontSize = 11;
        this.textColor = "#523747";
        this.images = {
          foreground: this.sketch.loadImage("/assets/floor.png"),
          background: this.sketch.loadImage("/assets/background.png"),
          pipe: this.sketch.loadImage("/assets/pipe.png"),
          gameOver: this.sketch.loadImage("/assets/game_over.png"),
          start: this.sketch.loadImage("/assets/start_button.png"),
          ok: this.sketch.loadImage("/assets/ok_button.png"),
          submit: this.sketch.loadImage("/assets/submit_button.png"),
          versus: this.sketch.loadImage("/assets/versus_button.png"),
          train: this.sketch.loadImage("/assets/train_button.png"),
          highScores: this.sketch.loadImage("/assets/high_scores_button.png"),
          credits: this.sketch.loadImage("/assets/credits_button.png"),
          scoreboard: this.sketch.loadImage("/assets/score_box.png"),
          getReady: this.sketch.loadImage("/assets/get_ready.png"),
          textBox: this.sketch.loadImage("/assets/box.png"),
          "0": this.sketch.loadImage("/assets/0.png"),
          "1": this.sketch.loadImage("/assets/1.png"),
          "2": this.sketch.loadImage("/assets/2.png"),
          "3": this.sketch.loadImage("/assets/3.png"),
          "4": this.sketch.loadImage("/assets/4.png"),
          "5": this.sketch.loadImage("/assets/5.png"),
          "6": this.sketch.loadImage("/assets/6.png"),
          "7": this.sketch.loadImage("/assets/7.png"),
          "8": this.sketch.loadImage("/assets/8.png"),
          "9": this.sketch.loadImage("/assets/9.png"),
        };
        this.animations = {
          title: this.sketch.loadAnimation(
            "/assets/title_midflap.png",
            "/assets/title_upflap.png",
            "/assets/title_midflap.png",
            "/assets/title_downflap.png"
          ),
          bird: this.sketch.loadAnimation(
            "/assets/midflap.png",
            "/assets/upflap.png",
            "/assets/midflap.png",
            "/assets/downflap.png"
          ),
          glasses: this.sketch.loadAnimation(
            "/assets/midflap_oculos.png",
            "/assets/upflap_oculos.png",
            "/assets/midflap_oculos.png",
            "/assets/downflap_oculos.png"
          )
        };
      };
      this.sketch.setup = () => {
        this.canvas = this.sketch.createCanvas(this.width, this.height);
        this.canvas.parent(this.canvasId);
        this.sketch.frameRate(this.framerate);
        this.sketch.textFont(this.font);
        this.sketch.textSize(this.fontSize);
        this.sketch.fill(this.textColor);
        this.sketch.noStroke();

        this.sprites = {
          background: this.sketch.createSprite(this.width / 2, this.height / 2),
          title: this.sketch.createSprite(this.width / 2, 0),
          start: this.sketch.createSprite(this.width / 2, 0),
          highScores: this.sketch.createSprite(this.width / 2, 0),
          credits: this.sketch.createSprite(this.width / 2, 0),
          bird: this.sketch.createSprite(0, 0),
          getReady: this.sketch.createSprite(this.width / 2, 0),
          scoreboard: this.sketch.createSprite(this.width / 2, 0),
          ok: this.sketch.createSprite(this.width / 2, 0),
          submit: this.sketch.createSprite(this.width / 2, 0),
          textBox: this.sketch.createSprite(this.width / 2, 0),
        };
        this.sprites.background.addImage(this.images.background);
        this.sprites.title.addAnimation("title", this.animations.title);
        this.sprites.title.animation.frameDelay = 10;
        this.sprites.start.addImage(this.images.start);
        this.sprites.highScores.addImage(this.images.highScores);
        this.sprites.credits.addImage(this.images.credits);
        this.sprites.bird.addAnimation("bird", this.animations.bird);
        this.sprites.title.animation.frameDelay = 5;
        this.sprites.getReady.addImage(this.images.getReady);
        this.sprites.scoreboard.addImage(this.images.scoreboard);
        this.sprites.ok.addImage(this.images.ok);
        this.sprites.submit.addImage(this.images.submit);
        this.sprites.textBox.addImage(this.images.textBox);


        this.spriteGroups = {
          foreground: new this.sketch.Group(),
          pipes: new this.sketch.Group(),
        };

        // this.spriteClasses = {
          // start: new Button(0, 0, this.game.images.start)
        // };

        for (let i = 0; i<(this.width/this.images.foreground.width)+2; i++) {
          const sprite = sketch.createSprite(0, 0);
          sprite.addImage(this.images.foreground);
          sprite.position.x = (i+1/2)*sprite.width;
          sprite.position.y = this.height-sprite.height/2;
          this.spriteGroups.foreground.add(sprite);
        }

        this.animations.title.frameDelay = 10;

        this.start();

      };
      this.sketch.draw = () => {
        this.update(this.sketch);
        this.draw(this.sketch);
      };
      this.sketch.keyPressed = (e) => {
        this.keyPressed(e);
      };
      this.sketch.mouseClicked = (e) => {
        this.mouseClicked(e);
      };
      this.sketch.touchStarted = (e) => {
        this.touchStarted(e);
      };
    });
    this.screens = screens.screens(this);

  }
  start() {
    this.changeScreen(this.screens.menuScreen);
  }
  changeScreen(screen, previousScreen) {
    screen.init(this.sketch, previousScreen);
    this.update = screen.update.bind(screen);
    this.draw = screen.draw.bind(screen);
    this.updateDom = screen.updateDom.bind(screen);
    this.keyPressed = screen.keyPressed.bind(screen);
    this.mouseClicked = screen.mouseClicked.bind(screen);
    this.touchStarted = screen.touchStarted.bind(screen);
  }
  init() {}
  update() {}
  draw() {}
  updateDom() {}
  keyPressed() {}
  mouseClicked() {}
  touchStarted() {}
}
