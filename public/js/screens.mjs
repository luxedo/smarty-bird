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
  init(sketch) {
    this._fadeOut = undefined;
    this._fadeIn = 255;
  }
  update(sketch) {
  }
  draw() {}
  updateDom() {}
  keyPressed() {}
  mouseClicked() {}
  touchStarted() {}
  fadeOut() {
    this._fadeOut = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this._fadeOut >= 255) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  }
  checkFadeIn(sketch) {
    if (this._fadeIn != null && this._fadeIn >= 0) {
      sketch.fill(0, 0, 0, this._fadeIn);
      sketch.rect(0, 0, this.game.width, this.game.height);
      this._fadeIn -= 20;
      if (this.fadeIn <= 0) {
        this.fadeIn = null;
      }
    }
  }
  checkFadeOut(sketch) {
    if (this._fadeOut >= 0) {
      sketch.fill(0, 0, 0, this._fadeOut);
      sketch.rect(0, 0, this.game.width + 1, this.game.height);
      this._fadeOut += 20;
    }
  }
}

export class MovingScreen extends BlankScreen {
  init(sketch) {
    super.init(sketch);

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
    super.update(sketch);

    const lastTileX = this.foreground.toArray().reduce((acc, tile) => tile.position.x > acc ? tile.position.x : acc, 0);
    this.foreground.toArray().forEach(tile => {
      if (tile.position.x < -this.foregroundWidth) {
        tile.position.x = lastTileX + this.foregroundWidth;
      }
    });
  }
  draw(sketch) {
    super.draw();

    sketch.drawSprite(this.background);
    sketch.drawSprites(this.foreground);
  }
}

export class MenuScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);

    this.titleY = 100;
    this.title = sketch.createSprite(this.game.width / 2, this.titleY);
    this.title.addAnimation("title", this.game.animations.titleAnimation);
    this.title.animation.frameDelay = 10;

    this.buttons = "main";

    this.startY = 240;
    this.start = new Button(sketch, this.game.width / 2, this.startY, this.game.images.start);

    this.highScoresY = 300;
    this.highScores = new Button(sketch, this.game.width / 2, this.highScoresY, this.game.images.highScores);

    this.creditsY = 360;
    this.credits = new Button(sketch, this.game.width / 2, this.creditsY, this.game.images.credits);

    this.singleY = 240;
    this.single = new Button(sketch, this.game.width / 2, this.singleY, this.game.images.start);

    this.versusY = 300;
    this.versus = new Button(sketch, this.game.width / 2, this.versusY, this.game.images.versus);

    this.trainY = 360;
    this.train = new Button(sketch, this.game.width / 2, this.trainY, this.game.images.train);
  }
  update(sketch) {
    super.update(sketch);

    this.start.update();
    this.start.clicked(() => {
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.gameScreen));
    });

    this.highScores.update();
    this.highScores.clicked(() => {
      this.fadeOut();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.highScoresScreen));
    });

    this.credits.update();
    this.credits.clicked(() => {
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.creditsScreen));
    });
    this.title.position.y = this.titleY + 8 * Math.sin(Date.now() / 200);
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.title);
    sketch.drawSprite(this.start.sprite);
    sketch.drawSprite(this.highScores.sprite);
    sketch.drawSprite(this.credits.sprite);
    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
  }
}

class Button {
  constructor(sketch, x, y, image) {
    this.sprite = sketch.createSprite(x, y);
    this.initialY = y;
    this.sprite.mouseActive = true;
    this.sprite.addImage(image);
    this.active = true;
    this.disabled = false;
  }
  update() {
    if (this.sprite.mouseIsPressed) {
      this.sprite.position.y = this.initialY + 2;
    } else {
      this.sprite.position.y = this.initialY;
    }
  }
  clicked(action) {
    if (!this.disabled) {
      if (this.active && this.sprite.mouseIsPressed) {
        this.active = false;
        this.sprite.position.y = this.initialY + 2;
      } else if (!this.active && !this.sprite.mouseIsPressed) {
        this.disabled = true;
        action();
      }
    }
  }
}

export class GameScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);

    this.hovering = true;

    this.pipes = sketch.Group();

    this.bird = new Bird(sketch, this.game.width / 4, this.game.height / 7 * 3, 31, 24, this.game.animations.birdAnimation);
    this.bird.sprite.animation.play();
    this.gravity = 12 / this.game.fps;
    this.flapStrength = 6;

    this.score = 0;
    this.scoreGroup = makeNumberGroup(sketch, this.game.images, this.score, this.game.width / 2, 30);

    this.getReady = sketch.createSprite(this.game.width / 2, this.game.height / 5 * 2, 50, 50);
    this.getReady.addImage(this.game.images.getReady);
  }
  update(sketch) {
    super.update(sketch);

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
          this.scoreGroup = makeNumberGroup(sketch, this.game.images, this.score, this.game.width / 2, 20);
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
    super.draw(sketch);

    sketch.drawSprite(this.background);
    sketch.drawSprites(this.pipes);
    sketch.drawSprites(this.foreground);
    sketch.drawSprite(this.bird.sprite);
    if (this.hovering) {
      sketch.drawSprite(this.getReady);
    }
    sketch.drawSprites(this.scoreGroup);

    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
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

    this.opacity = 0;

    this.scoreboardY = 250;
    this.scoreboardSpeed = 30;
    this.scoreboard = sketch.createSprite(this.game.width / 2, this.game.height + 300, 240, 130);
    this.scoreboard.setVelocity(0, -this.scoreboardSpeed);
    this.scoreboard.addImage(this.game.images.scoreboard);
    this.scoreGroup = makeNumberGroup(sketch, this.game.images, this.previousScreen.score, 97, 260);
    this.best = parseInt(window.localStorage.getItem("best"));
    this.best = this.best > this.previousScreen.score ? this.best : this.previousScreen.score;
    window.localStorage.setItem("best", this.best);
    this.bestGroup = makeNumberGroup(sketch, this.game.images, this.best, this.game.width - 102, 260);

    this.btnY = this.game.height / 4 * 3;
    this.okButton = new Button(sketch, this.game.width / 4, this.btnY, this.game.images.ok);
    this.submitButton = new Button(sketch, this.game.width / 4 * 3, this.btnY, this.game.images.submit);
  }
  update(sketch) {
    if (this.scoreboard.position.y <= this.scoreboardY) {
      this.scoreboard.setVelocity(0, 0);
      this.showNumbers = true;
    }

    this.okButton.update();
    this.okButton.clicked(() => {
      this.fadeOut();
      this.game.changeScreen(this.game.screens.menuScreen);
    });

    this.submitButton.update();
    this.submitButton.clicked(() => {
      this.fadeOut();
      if (this.game.db.user !== undefined) {
        this.game.db.collection(this.game.collection).doc(this.game.db.user.uid).set({
            uid: this.game.db.user.uid,
            displayName: this.game.db.user.displayName,
            score: parseInt(this.best)
          })
          .then(function(docRef) {
            // console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            // console.error("Error adding document: ", error);
          });
      } else {
        // Gotta login buddy
      }
      setTimeout(() => {
        this.game.changeScreen(this.game.screens.highScoresScreen);
      }, 100);
    });
  }
  draw(sketch) {
    super.draw(sketch);

    sketch.drawSprite(this.previousScreen.background);
    sketch.drawSprites(this.previousScreen.pipes);
    sketch.drawSprites(this.previousScreen.foreground);
    sketch.drawSprite(this.previousScreen.bird.sprite);

    sketch.drawSprite(this.scoreboard);
    if (this.showNumbers) {
      sketch.drawSprites(this.scoreGroup);
      sketch.drawSprites(this.bestGroup);
    }
    sketch.drawSprite(this.okButton.sprite);
    sketch.drawSprite(this.submitButton.sprite);
    sketch.drawSprite(this.title);
    sketch.tint(255, this.opacity);
    if (this.opacity < 255) {
      this.opacity += 8;
    }
    sketch.image(this.game.images.gameOver, this.game.width / 2 - this.game.images.gameOver.width / 2, 70);
  }
}

class InfoScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);
    this.okButton = new Button(sketch, this.game.width / 2, this.game.height - 50, this.game.images.ok);

    this.titleY = 60;
    this.title = sketch.createSprite(this.game.width / 2, this.titleY);
    this.title.addAnimation("title", this.game.animations.titleAnimation);
    this.title.animation.frameDelay = 10;

    this.box = sketch.createSprite(this.game.width / 2, this.game.height/2 + 20);
    this.box.addImage(this.game.images.textBox);
  }
  update(sketch) {
    super.update(sketch);

    this.okButton.update();
    this.okButton.clicked(() => {
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.menuScreen));
    });
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.okButton.sprite);
    sketch.drawSprite(this.title);
    sketch.drawSprite(this.box);
  }
}

class HighScoresScreen extends InfoScreen {
  init(sketch) {
    super.init(sketch);
    this.playerPosition = null;
    this.game.db.collection(this.game.collection).orderBy("score", "desc")
      // .limit(10)
      .get()
      .then((querySnapshot) => {
        this.data = querySnapshot.docs.map(doc => doc.data());
        this.data.forEach((item, index) => {
          if (this.game.db.user !== undefined && this.game.db.user.uid == item.uid) {
            this.playerPosition = index+1;
            this.playerDisplayName = item.displayName;
            this.playerScore = item.score;
          }
        });
      });
    this.ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  }
  update(sketch) {
    super.update(sketch);
  }
  draw(sketch) {
    super.draw(sketch);
    if (this.data == undefined) {
      sketch.text(`Loading...`, this.game.width/2-40, this.game.height/2);
    } else {
      this.ordinal.map((ord, index) => {
        const item = this.data[index];
        if (this.game.db.user !== undefined && this.game.db.user.uid == item.uid) {
          sketch.fill(255, 0, 0, 40);
          sketch.rect(30, 213+(index-1)*16, 260, 17);
          sketch.fill(this.game.textColor);
        }
        sketch.text(`${ord} - ${item.displayName}`, this.game.width/8, 210+index*16);
        sketch.text(`${item.score}`, this.game.width/8*6.5, 210+index*16);
      });
    }

    if (this.playerPosition > 10) {
      sketch.fill(255, 0, 0, 40);
      sketch.rect(30, 367, 260, 17);
      sketch.fill(this.game.textColor);
      sketch.text(`${this.playerPosition} - ${this.playerDisplayName}`, this.game.width/8, 380);
      sketch.text(`${this.playerScore}`, this.game.width/8*6.5, 380);
    }

    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
  }
}

class CreditsScreen extends InfoScreen {
  init(sketch) {
    super.init(sketch);
  }
  update(sketch) {
    super.update(sketch);
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.text(`This is a copy of the game "Flappy`, this.game.width/11, 140);
    sketch.text(`Bird" with a genetic deep neural`, this.game.width/11, 153);
    sketch.text(`network AI, made by Luxedo and`, this.game.width/11, 166);
    sketch.text(`Faifos.`, this.game.width/11, 179);
    sketch.text(`Thanks to the playtesters ...`, this.game.width/11, 200);

    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
  }
}

export function screens(game) {
  return {
    menuScreen: new MenuScreen(game),
    // menuScreen: new HighScoresScreen(game),
    // menuScreen: new CreditsScreen(game),
    gameScreen: new GameScreen(game),
    gameOverScreen: new GameOverScreen(game),
    highScoresScreen: new HighScoresScreen(game),
    creditsScreen: new CreditsScreen(game),
  };
}

function makeNumberGroup(sketch, images, number, x, y) {
  number = Math.round(number).toString().split("");
  const spacing = 30;
  const half = number.length / 2;
  const group = sketch.Group();
  number.forEach((digit, index) => {
    const sprite = sketch.createSprite(x - (half - 0.5 - index) * spacing, y, 27, 34);
    sprite.addImage(images[digit]);
    group.add(sprite);
  });
  return group;
}
