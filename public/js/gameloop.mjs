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
  constructor(firestore) {
    this.firestore = firestore;
    this.fps = 30;
    this.width = 320;
    this.height = 480;
    this.canvasId = "game-box";
    this.sketch = null;
    this.p5 = new p5((sketch) => {
      this.sketch = sketch;
      this.sketch.preload = () => {
        // this.font = sketch.loadFont("/assets/FlappyBirdy.ttf")
        // this.fontSize = 40
        this.images = {
          floor: this.sketch.loadImage("/assets/floor.png"),
          background: this.sketch.loadImage("/assets/background.png"),
          pipe: this.sketch.loadImage("/assets/pipe.png"),
          gameOver: this.sketch.loadImage("/assets/title.png"),
          start: this.sketch.loadImage("/assets/start_button.png"),
          ok: this.sketch.loadImage("/assets/ok_button.png"),
          scoreboard: this.sketch.loadImage("/assets/score_box.png"),
          tap: this.sketch.loadImage("/assets/tap_button.png"),
        };
        this.animations = {
          titleAnimation: this.sketch.loadAnimation(
            // "/assets/title.png",
            "/assets/title_midflap.png",
            // "/assets/title.png",
            "/assets/title_upflap.png"
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
