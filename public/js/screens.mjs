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
class BlankScreen {
  constructor(game) {
    this.game = game;
  }
  init() {}
  update() {}
  draw() {}
  updateDom() {}
  keyPressed() {}
  mouseClicked() {}
  touchStarted() {}
}

export class MovingScreen extends BlankScreen {
  init(sketch) {
    this.background = sketch.createSprite(this.game.width / 2, this.game.height / 2, this.game.width, this.game.height);
    this.background.addImage(this.game.images.background);
    this.foregroundWidth = 56;
    this.foregroundHeight = 72;
    this.foreground = sketch.Group();
    this.speed = 2;
    Array.from(Array(Math.ceil(this.game.width / this.foregroundWidth) + 2).keys()).forEach((tile, index) => {
      const sprite = sketch.createSprite(index * this.foregroundWidth, this.game.height - this.foregroundHeight / 2, this.foregroundWidth, this.foregroundHeight);
      sprite.setSpeed(this.speed, 180);
      sprite.addImage(this.game.images.floor);
      this.foreground.add(sprite);
    });
  }
  update(sketch) {
    const lastTileX = this.foreground.toArray().reduce((acc, tile) => tile.position.x > acc ? tile.position.x : acc, 0);
    this.foreground.toArray().forEach(tile => {
      if (tile.position.x < -this.foregroundWidth) {
        tile.position.x = lastTileX + this.foregroundWidth;
      }
    });
  }
  draw(sketch) {
    sketch.drawSprite(this.background);
    sketch.drawSprites(this.foreground);
  }
}

export class MenuScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);

    this.fadeOut = undefined;
    this.clicked = undefined;
    this.fadeIn = 255;

    this.startWidth = 90;
    this.startHeight = 30;
    this.startY = 370;
    this.start = sketch.createSprite(this.game.width / 2, this.startY, this.startWidth, this.startHeight);
    this.start.mouseActive = true;
    this.start.addImage(this.game.images.start);

    this.titleWidth = 270;
    this.titleHeight = 60;
    this.titleY = 160;
    this.title = sketch.createSprite(this.game.width / 2, this.titleY, this.titleWidth, this.titleHeight);
    this.title.addAnimation("title", this.game.animations.titleAnimation);
    this.title.animation.frameDelay = 10;
  }
  update(sketch) {
    super.update(sketch);
    if (this.fadeIn != null && this.fadeIn <= 0) {
      this.fadeIn = null;
    }
    if (this.start.mouseIsPressed) {
      this.start.position.y = this.startY + 2;
      this.clicked = true;
    } else {
      this.start.position.y = this.startY;
      if (!!this.clicked) {
        this.clicked = false;
        this.fadeOut = 0;
        this.start.mouseActive = false;
      }
      if (this.fadeOut >= 255) {
        this.game.changeScreen(this.game.screens.gameScreen);
      }
    }
    this.title.position.y = this.titleY + 8 * Math.sin(Date.now() / 200);
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.start);
    sketch.drawSprite(this.title);
    if (this.fadeOut >= 0) {
      sketch.noStroke();
      sketch.fill(0, 0, 0, this.fadeOut);
      sketch.rect(0, 0, this.game.width + 1, this.game.height);
      this.fadeOut += 20;
    }
    if (this.fadeIn != null && this.fadeIn >= 0) {
      sketch.noStroke();
      sketch.fill(0, 0, 0, this.fadeIn);
      sketch.rect(0, 0, this.game.width + 1, this.game.height);
      this.fadeIn -= 20;
    }
  }
}

export class GameScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);
    this.fadeIn = 255;
    this.hovering = true;

    this.pipes = sketch.Group();

    this.bird = new Bird(sketch, this.game.width / 4, this.game.height / 3, 31, 24, this.game.animations.birdAnimation);
    this.bird.sprite.animation.play();
    this.gravity = 12 / this.game.fps;
    this.flapStrength = 6;

    this.score = 0;

    this.tap = sketch.createSprite(this.game.width/2, this.game.height/2, 50, 50);
    this.tap.addImage(this.game.images.tap);
  }
  update(sketch) {
    super.update(sketch);

    // Set fadeIn and waiting for input
    if (this.fadeIn != null && this.fadeIn <= 0) {
      this.fadeIn = null;
    }

    // Update pipes
    if (!this.hovering) {
      const gap = 180;
      const slit = 100;
      const pipeWidth = 52;

      const lastPipe = this.pipes.toArray().reduce((acc, pipe) => {
        // Remove old pipes
        if (pipe.position.x < -100) {
          this.pipes.remove(pipe);
        }
        // Increase score
        if (!pipe.scored && this.bird.sprite.position.x > pipe.position.x + pipeWidth / 2) {
          pipe.scored = true;
          this.score += 0.5; // Adding 2*0.5 (top and bottom pipes)
        }
        return pipe.position.x > acc.position.x ? pipe : acc;
      }, {
        position: {
          x: 0
        }
      });

      if (lastPipe.position.x < this.game.width - gap) {
        const pipeHeight = 320;
        const slitHeight = Math.random() * 160 - 80;
        const pipeX = lastPipe.position.x === 0 ? this.game.width + pipeWidth / 2 : lastPipe.position.x + gap + pipeWidth / 2;
        const pipeTop = sketch.createSprite(pipeX, slitHeight, pipeWidth, pipeHeight);
        pipeTop.addImage(this.game.images.pipe);
        pipeTop.mirrorY(-1);
        pipeTop.setSpeed(this.speed, 180);
        this.pipes.add(pipeTop);

        const pipeBottom = sketch.createSprite(pipeX, slitHeight + slit + pipeHeight, pipeWidth, pipeHeight);
        pipeBottom.setSpeed(this.speed, 180);
        pipeBottom.addImage(this.game.images.pipe);
        this.pipes.add(pipeBottom);
      }

      // Update bird
      this.bird.update();
      this.bird.sprite.addSpeed(this.gravity, 90);
      const borderHeight = -100;
      if (this.bird.sprite.position.y < borderHeight) {
        this.bird.sprite.position.y = borderHeight;
        this.bird.sprite.velocity.y = 0;
      }
      if (this.pipes.overlap(this.bird.sprite)) {
        this.bird.dead = true;
        this.pipes.toArray().forEach(pipe => {
          pipe.setSpeed(0, 0);
        });
        this.foreground.toArray().forEach(tile => {
          tile.setSpeed(0, 0);
        });
      }
      if (this.foreground.overlap(this.bird.sprite)) {
        this.bird.sprite.position.y = this.game.height - this.foregroundHeight;
        this.bird.sprite.velocity.y = 0;
        this.bird.sprite.animation.stop();
        this.pipes.toArray().forEach(pipe => {
          pipe.setSpeed(0, 0);
        });
        this.foreground.toArray().forEach(tile => {
          tile.setSpeed(0, 0);
        });
        this.game.changeScreen(this.game.screens.gameOverScreen, this);
      }
    }
  }
  draw(sketch) {
    sketch.drawSprite(this.background);
    sketch.drawSprites(this.pipes);
    sketch.drawSprites(this.foreground);
    sketch.drawSprite(this.bird.sprite);
    if (this.hovering) {
      sketch.drawSprite(this.tap);
    }

    // sketch.textFont(this.font);
    // sketch.textSize(this.fontSize);
    // sketch.textAlign(sketch.CENTER);
    // sketch.text(`${this.score}`, this.game.width/2, 20);

    if (this.fadeIn != null && this.fadeIn >= 0) {
      sketch.noStroke();
      sketch.fill(0, 0, 0, this.fadeIn);
      sketch.rect(0, 0, this.game.width + 1, this.game.height);
      this.fadeIn -= 20;
    }
  }
  keyPressed() {
    this.hovering = false;
    this.bird.flap(this.flapStrength);
  }
  mouseClicked() {
    this.hovering = false;
    this.bird.flap(this.flapStrength);
  }
}

class Bird {
  constructor(sketch, x, y, w, h, animation) {
    this.sprite = sketch.createSprite(x, y, w, h);
    this.sprite.addAnimation("bird", animation);
    this.sprite.setCollider("circle");
    this.dead = false;
  }
  flap(strength) {
    if (!this.dead) {
      this.sprite.setSpeed(strength, -90);
    }
  }
  update() {
    let rotation = (this.sprite.velocity.y - 4) * 12;
    rotation = rotation < -30 ? -30 : rotation;
    rotation = rotation > 90 ? 90 : rotation;
    this.sprite.rotation = rotation;
  }
}

class GameOverScreen extends BlankScreen {
  init(sketch, previousScreen) {
    this.previousScreen = previousScreen;
    this.previousScreen.draw(this.game.sketch);

    this.fadeOut = undefined;
    this.clicked = undefined;

    this.opacity = 0;

    this.scoreboardY = 250;
    this.scoreboardSpeed = 30;
    this.scoreboard = sketch.createSprite(this.game.width / 2 , this.game.height+300, 240, 130);
    this.scoreboard.setVelocity(0, -this.scoreboardSpeed);
    this.scoreboard.addImage(this.game.images.scoreboard);

    this.btnWidth = 90;
    this.btnHeight = 30;
    this.btnY = this.game.height / 4 * 3;
    this.okButton = sketch.createSprite(this.game.width / 4 , this.btnY, this.btnWidth, this.btnHeight);
    this.shareButton = sketch.createSprite(this.game.width / 4 * 3, this.btnY, this.btnWidth, this.btnHeight);
    this.okButton.mouseActive = true;
    this.okButton.addImage(this.game.images.ok);
    this.shareButton.mouseActive = true;
    this.shareButton.addImage(this.game.images.ok);
  }
  update(sketch) {
    if (this.scoreboard.position.y <= this.scoreboardY) {
      this.scoreboard.setVelocity(0, 0);
    }
    if (this.okButton.mouseIsPressed) {
      this.okButton.position.y = this.btnY + 2;
      this.clicked = true;
    } else if (!this.okButton.mouseIsPressed) {
      this.okButton.position.y = this.btnY;
      if (!!this.clicked) {
        this.clicked = false;
        this.fadeOut = 0;
        this.okButton.mouseActive = false;
      }
      if (this.fadeOut >= 255) {
        this.game.changeScreen(this.game.screens.menuScreen);
      }
    }
    if (this.shareButton.mouseIsPressed) {
      this.shareButton.position.y = this.btnY + 2;
    } else if (!this.shareButton.mouseIsPressed){
      this.shareButton.position.y = this.btnY;
    }
  }
  draw(sketch) {
    sketch.drawSprite(this.previousScreen.background);
    sketch.drawSprites(this.previousScreen.pipes);
    sketch.drawSprites(this.previousScreen.foreground);
    sketch.drawSprite(this.previousScreen.bird.sprite);

    sketch.drawSprite(this.scoreboard);
    sketch.drawSprite(this.okButton);
    sketch.drawSprite(this.shareButton);
    sketch.drawSprite(this.title);
    sketch.tint(255, this.opacity);
    if (this.opacity < 255) {
      this.opacity+=8;
    }
    sketch.image(this.game.images.gameOver, this.game.width/2-this.game.images.gameOver.width/2, 70);

    if (this.fadeOut >= 0) {
      sketch.noStroke();
      sketch.fill(0, 0, 0, this.fadeOut);
      sketch.rect(0, 0, this.game.width + 1, this.game.height);
      this.fadeOut += 20;
    }
  }
}

export function screens(game) {
  return {
    menuScreen: new MenuScreen(game),
    gameScreen: new GameScreen(game),
    gameOverScreen: new GameOverScreen(game),
  };
}
