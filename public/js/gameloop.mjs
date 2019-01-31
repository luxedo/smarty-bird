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
          floor: this.sketch.loadImage("/assets/floor.png"),
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
          titleAnimation: this.sketch.loadAnimation(
            "/assets/title_midflap.png",
            "/assets/title_upflap.png",
            "/assets/title_midflap.png",
            "/assets/title_downflap.png"
          ),
          birdAnimation: this.sketch.loadAnimation(
            "/assets/midflap.png",
            "/assets/upflap.png"
          )
        };
        this.animations.titleAnimation.frameDelay = 10;
        this.start();
      };
      this.sketch.setup = () => {
        this.canvas = this.sketch.createCanvas(this.width, this.height);
        this.canvas.parent(this.canvasId);
        this.sketch.frameRate(this.framerate);
        this.sketch.textFont(this.font);
        this.sketch.textSize(this.fontSize);
        this.sketch.fill(this.textColor);
        this.sketch.noStroke();
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
