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
import * as draw from './draw.mjs';

class BlankScreen {
  constructor(game, canvasId) {
    this.game = game;
    this.p5 = new p5((p5) => {
      p5.setup = () => {
        this.canvas = p5.createCanvas(this.game.width, this.game.height);
        this.canvas.parent(canvasId);
        this.init(p5);
      }
      p5.draw = () => {
        this.draw(p5)
      };
    });
  }
  init() {}
  update() {}
  draw() {}
  updateDom() {}
}

export class MenuScreen extends BlankScreen {
  init(p5) {
  }
  draw(p5) {
  }
}
