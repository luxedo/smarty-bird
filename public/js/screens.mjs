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
  update(sketch) {}
  draw(sketch) {}
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

class MovingScreen extends BlankScreen {
  init(sketch) {
    super.init(sketch);
    this.game.spriteGroups.foreground.toArray().forEach(tile => {
      tile.setVelocity(-this.game.speed, 0);
    });
  }
  update(sketch) {
    super.update(sketch);
    const lastTileX = this.game.spriteGroups.foreground.toArray().reduce((acc, tile) => tile.position.x > acc ? tile.position.x : acc, 0);
    this.game.spriteGroups.foreground.toArray().forEach(tile => {
      if (tile.position.x < -this.game.images.foreground.width) {
        tile.position.x = lastTileX + this.game.images.foreground.width;
      }
    });
  }
  draw(sketch) {
    super.draw();
    sketch.drawSprite(this.game.sprites.background);
    sketch.drawSprites(this.game.spriteGroups.foreground);
  }
}

class MenuScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);

    this.titleY = 100;
    this.game.sprites.title.position.y = this.titleY;

    this.start = new Button(this.game.sprites.start);
    this.start.setY(220);

    this.train = new Button(this.game.sprites.train);
    this.train.setY(270);

    this.highScores = new Button(this.game.sprites.highScores);
    this.highScores.setY(320);

    this.credits = new Button(this.game.sprites.credits);
    this.credits.setY(370);
  }
  update(sketch) {
    super.update(sketch);
    this.start.update();
    this.start.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.singleScreen));
    });

    this.train.update();
    this.train.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.trainScreen));
    });

    this.highScores.update();
    this.highScores.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.highScoresScreen));
    });

    this.credits.update();
    this.credits.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.creditsScreen));
    });
    this.game.sprites.title.position.y = this.titleY + 8 * Math.sin(Date.now() / 200);
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.game.sprites.title);
    sketch.drawSprite(this.start.sprite);
    sketch.drawSprite(this.train.sprite);
    sketch.drawSprite(this.highScores.sprite);
    sketch.drawSprite(this.credits.sprite);

    sketch.textAlign(sketch.CENTER);
    sketch.text("V1.0-beta", this.game.width/2, this.game.height*0.95);
    sketch.textAlign(sketch.LEFT);

    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
  }
}

class Button {
  constructor(sprite) {
    this.sprite = sprite;
    this.sprite.mouseActive = true;
    this.active = true;
    this.disabled = false;
  }
  setY(y) {
    this.initialY = y;
    this.sprite.position.y = y;
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
  reset() {
    this.active = true;
    this.disabled = false;
  }
}

class PipesScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);
    this.game.spriteGroups.pipes.toArray().forEach(pipe => pipe.remove());
    this.game.spriteGroups.pipes.removeSprites();
    this.showPipes = true;
    this.pipeGap = 160;
    this.pipesCount = 0;
  }
  update(sketch) {
    super.update(sketch);

    if (this.showPipes) {
      const slit = 100 + 100 * (1 - Math.tanh(this.pipesCount / 5)); // Slit goes from 200 to 100 with the tanh function

      const lastPipe = this.game.spriteGroups.pipes.toArray().reduce((acc, pipe) => {
        // Remove old pipes
        if (pipe.position.x < -100) {
          this.game.spriteGroups.pipes.remove(pipe);
          pipe.remove();
        }
        return pipe.position.x > acc.position.x ? pipe : acc;
      }, {
        position: {
          x: 0
        }
      });

      if (lastPipe.position.x < this.game.width - this.pipeGap) {
        const slitHeight = Math.random() * 150 - 130;
        const pipeX = lastPipe.position.x === 0 ? this.game.width : lastPipe.position.x + this.pipeGap + this.game.images.pipe.width;
        const pipeTop = sketch.createSprite(pipeX, slitHeight);
        pipeTop.addImage(this.game.images.pipe);
        pipeTop.mirrorY(-1);
        pipeTop.setVelocity(-this.game.speed, 0);
        pipeTop.slitHeight = slitHeight;
        this.game.spriteGroups.pipes.add(pipeTop);

        const pipeBottom = sketch.createSprite(pipeX, slitHeight + slit + this.game.images.pipe.height);
        pipeBottom.setVelocity(-this.game.speed, 0);
        pipeBottom.addImage(this.game.images.pipe);
        pipeTop.slitHeight = slitHeight;
        this.game.spriteGroups.pipes.add(pipeBottom);

        this.pipesCount++;
      }
    }
  }
  draw(sketch) {
    // super.draw(sketch);
    sketch.drawSprite(this.game.sprites.background);
    sketch.drawSprites(this.game.spriteGroups.pipes);
    sketch.drawSprites(this.game.spriteGroups.foreground);
  }
  pause() {
    this.game.spriteGroups.pipes.toArray().forEach(pipe => pipe.setVelocity(0, 0));
    this.game.spriteGroups.foreground.toArray().forEach(tile => tile.setVelocity(0, 0));
  }
  resume() {
    this.game.spriteGroups.pipes.toArray().forEach(pipe => pipe.setVelocity(-this.game.speed, 0));
    this.game.spriteGroups.foreground.toArray().forEach(tile => tile.setVelocity(-this.game.speed, 0));
  }
}

class SingleScreen extends PipesScreen {
  init(sketch) {
    super.init(sketch);

    this.bird = new Bird(this.game.sprites.bird);
    this.bird.sprite.position.x = this.game.width / 4;
    this.bird.sprite.position.y = this.game.height / 7 * 3;
    this.bird.sprite.setVelocity(0, 0);
    this.bird.sprite.rotation = 0;
    this.bird.sprite.animation.play();
    this.flapStrength = 6;

    this.score = 0;

    this.showPipes = false;

    this.game.sprites.getReady.position.y = this.game.height / 5 * 2;
  }
  update(sketch) {
    super.update(sketch);

    const scored = this.game.spriteGroups.pipes.toArray().reduce((acc, pipe) => {
      // Increase score
      if (!pipe.scored && this.bird.sprite.position.x > pipe.position.x + this.game.images.pipe.width / 2) {
        pipe.scored = true;
        acc = true;
      }
      return acc;
    }, false);

    if (scored) {
      this.score += 1;
      this.game.sounds.point.play();
    }

    if (this.showPipes) {
      this.bird.update();
      this.bird.sprite.addSpeed(this.game.gravity, 90);

      const borderHeight = -100;
      if (this.bird.sprite.position.y < borderHeight) {
        this.bird.sprite.position.y = borderHeight;
        this.bird.sprite.velocity.y = 0;
      }

      if (this.game.spriteGroups.pipes.overlap(this.bird.sprite)) {
        this.killBird();
      }
      if (this.game.spriteGroups.foreground.overlap(this.bird.sprite)) {
        this.killBird();

        this.bird.sprite.position.y = this.game.height - this.game.images.foreground.height;
        this.bird.sprite.velocity.y = 0;
        this.bird.sprite.animation.stop();

        this.game.changeScreen(this.game.screens.gameOverScreen, this);
      }
    }
  }
  draw(sketch) {
    super.draw(sketch);

    sketch.drawSprite(this.bird.sprite);
    if (!this.showPipes) {
      sketch.drawSprite(this.game.sprites.getReady);
    }

    drawNumber(sketch, this.score, this.game.width / 2, 30, this.game.images.digits);

    this.checkFadeIn(sketch);
  }
  keyPressed() {
    this.showPipes = true;
    this.bird.flap(this.flapStrength);
    this.game.sounds.wing.play();
  }
  mouseClicked() {
    this.showPipes = true;
    this.bird.flap(this.flapStrength);
    this.game.sounds.wing.jump(0.03, 0.3);
  }
  killBird() {
    if (!this.bird.dead) {
      this.game.sounds.hit.jump(0.1, 0.3);
      setTimeout(() => {
        this.game.sounds.die.play();
      }, 300);
    }
    this.bird.dead = true;
    this.game.spriteGroups.pipes.toArray().forEach(pipe => {
      pipe.setSpeed(0, 0);
    });
    this.game.spriteGroups.foreground.toArray().forEach(tile => {
      tile.setSpeed(0, 0);
    });
  }
}

class Bird {
  constructor(sprite) {
    this.sprite = sprite;
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
    super.init(sketch);

    this.previousScreen = previousScreen;
    this.previousScreen.draw(this.game.sketch);

    this.opacity = 0;
    this.gray = 0;

    this.game.sprites.bird.rotation = 90;

    this.game.sprites.blood.animation.rewind();
    this.game.sprites.blood.position.x = this.game.sprites.bird.position.x;
    this.game.sprites.blood.position.y = this.game.sprites.bird.position.y + 27;
    this.game.sprites.blood.animation.play();

    this.scoreboardY = 250;
    this.scoreboardSpeed = 30;
    // this.scoreboard = sketch.createSprite(this.game.width / 2, this.game.height + 300, 240, 130);
    this.game.sprites.scoreboard.position.y = this.game.height * 2;
    this.game.sprites.scoreboard.setVelocity(0, -this.scoreboardSpeed);

    this.showNumbers = false;

    this.best = parseInt(window.localStorage.getItem("best"));
    this.best = this.best > this.previousScreen.score ? this.best : this.previousScreen.score;
    if (this.game.db.user !== undefined) {
      this.game.db.collection(this.game.collection).doc(this.game.db.user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            this.best = this.best > doc.data().score ? this.best : doc.data().score;
          }
          window.localStorage.setItem("best", this.best);
        })
        .catch(function(error) {});
    }

    this.btnY = this.game.height / 4 * 3;

    this.ok = new Button(this.game.sprites.ok);
    this.ok.sprite.position.x = this.game.width / 4;
    this.ok.setY(this.btnY);

    this.submit = new Button(this.game.sprites.submit);
    this.submit.sprite.position.x = this.game.width / 4 * 3;
    this.submit.setY(this.btnY);
  }
  update(sketch) {
    if (this.game.sprites.scoreboard.position.y <= this.scoreboardY) {
      this.game.sprites.scoreboard.setVelocity(0, 0);
      this.showNumbers = true;
    }

    this.ok.update();
    this.ok.clicked(() => {
      this.fadeOut().then(() => {
        this.game.sounds.swooshing.play();
        this.game.changeScreen(this.game.screens.menuScreen);
      });
    });

    if (this.game.db.user !== undefined) {
      this.submit.update();
      this.submit.clicked(() => {
        this.fadeOut().then(() => {
          this.game.sounds.swooshing.play();
          this.game.changeScreen(this.game.screens.highScoresScreen);
        });
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
      });
    }
  }
  draw(sketch) {
    // super.draw(sketch);
    sketch.drawSprite(this.game.sprites.background);
    sketch.drawSprites(this.game.spriteGroups.pipes);
    sketch.drawSprites(this.game.spriteGroups.foreground);
    sketch.drawSprite(this.game.sprites.bird);

    // sketch.filter(sketch.GRAY);

    sketch.drawSprite(this.game.sprites.blood);

    sketch.drawSprite(this.game.sprites.scoreboard);
    if (this.showNumbers) {
      drawNumber(sketch, this.previousScreen.score, 97, 230, this.game.images.digits);
      drawNumber(sketch, this.best, this.game.width - 102, 230, this.game.images.digits);
    }
    sketch.drawSprite(this.ok.sprite);

    if (this.game.db.user !== undefined) {
      sketch.drawSprite(this.submit.sprite);
    }

    if (this.opacity < 255) {
      sketch.tint(255, this.opacity);
      this.opacity += 8;
    }

    if (this.gray < 255) {
      this.gray += 3;
    }
    sketch.image(this.game.images.gameOver, this.game.width / 2 - this.game.images.gameOver.width / 2, 70);
    this.checkFadeOut(sketch);
  }
}

class InfoScreen extends MovingScreen {
  init(sketch) {
    super.init(sketch);

    this.back = new Button(this.game.sprites.back);
    // this.back.sprite.position.x = this.game.width/4;
    this.back.setY(455);

    this.titleY = 60;
    this.game.sprites.title.position.y = this.titleY;

    this.game.sprites.textBox.position.y = this.game.height / 2 + 30;
  }
  update(sketch) {
    super.update(sketch);

    this.back.update();
    this.back.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.menuScreen));
    });
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.back.sprite);
    sketch.drawSprite(this.game.sprites.title);
    sketch.drawSprite(this.game.sprites.textBox);
  }
}

class HighScoresScreen extends InfoScreen {
  init(sketch) {
    super.init(sketch);
    this.playerPosition = null;
    this.game.sprites.highScoresTitle.position.y = 160;
    this.game.db.collection(this.game.collection).orderBy("score", "desc")
      // .limit(10)
      .get()
      .then((querySnapshot) => {
        this.data = querySnapshot.docs.map(doc => doc.data());
        this.data.forEach((item, index) => {
          if (this.game.db.user !== undefined && this.game.db.user.uid == item.uid) {
            this.playerPosition = index + 1;
            this.playerDisplayName = item.displayName;
            this.playerScore = item.score;
          }
        });
      });
  }
  update(sketch) {
    super.update(sketch);
  }
  draw(sketch) {
    super.draw(sketch);
    sketch.drawSprite(this.game.sprites.highScoresTitle);
    if (this.data == undefined) {
      sketch.text(`Loading...`, this.game.width / 2 - 40, this.game.height / 2);
    } else {
      this.data.map((item, index) => {
        if (index < 10 || (this.game.db.user !== undefined && this.game.db.user.uid == item.uid)) {
          const ord = ordinalSuffixOf(index + 1);
          if (this.game.db.user !== undefined && this.game.db.user.uid == item.uid) {
            sketch.fill(255, 0, 0, 40);
            sketch.rect(30, 213 + (index - 1) * 16, 260, 17);
            sketch.fill(this.game.textColor);
          }
          sketch.text(`${ord} - ${item.displayName}`, this.game.width / 8, 210 + index * 16);
          sketch.text(`${item.score}`, this.game.width / 8 * 6.5, 210 + index * 16);
        }
      });
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
    sketch.text(`This is a reproduction of the game`, this.game.width / 11, 150);
    sketch.text(`"Flappy Bird" with a genetic deep`, this.game.width / 11, 165);
    sketch.text(`neural network AI, made by Luxedo`, this.game.width / 11, 180);
    sketch.text(`and Faifos.`, this.game.width / 11, 195);

    sketch.text(`Thanks to Andrew Tyler for the`, this.game.width / 11, 220);
    sketch.text(`pixelmix font.`, this.game.width / 11, 235);
    sketch.text(`Thanks to SuperTVGRFan18496 for`, this.game.width / 11, 255);
    sketch.text(`the sound assets.`, this.game.width / 11, 270);

    sketch.text(`Thanks to the playtesters ...`, this.game.width / 11, 295);


    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);
  }
}

class TrainScreen extends PipesScreen {
  init(sketch, previousScreen) {
    super.init(sketch);

    this.previousScreen = previousScreen;
    this.previousBestBird = this.previousScreen != undefined ? this.previousScreen.previousBestBird : undefined;
    this.gen = this.previousScreen != undefined ? this.previousScreen.gen + 1 : 1;

    this.showPipes = false;
    this.frames = 0;
    this.showPipesAfter = 0 * this.game.fps;

    this.legendBoxY = this.game.height / 2;
    this.legendBoxResting = 2 * this.game.height;
    this.game.sprites.textBox.position.y = this.previousScreen != undefined ? this.game.sprites.textBox.position.y : this.legendBoxResting;
    this.showLegend = this.previousScreen != undefined ? this.previousScreen.showLegend : false;
    this.legend = new Button(this.game.sprites.legend);
    this.legend.setY(this.game.height * 0.93);

    this.back = new Button(this.game.sprites.back);
    this.back.setY(this.game.height * 0.93);

    // this.versus = new Button(this.game.sprites.versus);
    // this.versus.setY(200);

    this.page = this.previousScreen != undefined ? this.previousScreen.page : 0;
    this.arrowBack = new Button(this.game.sprites.arrowBack);
    this.arrowBack.setY(this.game.height * 0.78);
    this.arrowBack.sprite.position.x = this.game.width*0.87;
    this.arrowNext = new Button(this.game.sprites.arrowNext);
    this.arrowNext.setY(this.game.height * 0.78);
    this.arrowNext.sprite.position.x = this.game.width*0.9;

    this.flock = this.game.spriteGroups.flock.toArray().map(sprite => {
      const bird = new SmartBird(sprite);
      bird.sprite.position.x = this.game.width / 2;
      bird.sprite.position.y = this.game.height / 7 * 3;
      bird.sprite.setVelocity(0, 0);
      bird.sprite.animation.play();
      return bird;
    });

    this.mutationProb = 0.5;
    if (this.previousBestBird != undefined) {
      // Breed best bird to fill 50% of the flock
      this.flock.slice(Math.floor(this.game.maxFlock * 0.5)).forEach((bird, index) => {
        if (index === 0) {
          // Keep one copy of the original winner
          bird.weightsDeep = this.previousBestBird.weightsDeep;
          bird.weightsOut = this.previousBestBird.weightsOut;
        } else {
          bird.weightsDeep = this.previousBestBird.weightsDeep.map(neuron => neuron.map(w => w + Math.random()<this.mutationProb?randomBm(0, this.game.weightsVariance):0));
          bird.weightsOut = this.previousBestBird.weightsOut.map(w => w + Math.random<this.mutationProb?randomBm(0, this.game.weightsVariance):0);
        }
      });
    }

    this.previousPipeDistance = Infinity;
    this.score = 0;
  }
  update(sketch) {
    super.update(sketch);
    if (this.frames == this.showPipesAfter) {
      this.showPipes = true;
    }
    this.frames++;

    this.legend.update();
    this.legend.clicked(() => {
      this.showLegend = !this.showLegend;
      this.legend.reset();
    });

    this.back.update();
    this.back.clicked(() => {
      this.game.sounds.swooshing.play();
      this.fadeOut().then(() => this.game.changeScreen(this.game.screens.menuScreen));
    });

    this.arrowBack.update();
    this.arrowBack.clicked(() => {
      this.arrowBack.reset();
      this.page = this.page===1?0:1;
    });
    this.arrowNext.update();
    this.arrowNext.clicked(() => {
      this.arrowNext.reset();
      this.page = this.page===1?0:1;
    });

    // this.versus.update();
    // this.versus.clicked(() => {
    //   this.fadeOut().then(() => this.game.changeScreen(this.game.screens.challengeScreen, this));
    // });

    const nextPipe = this.game.spriteGroups.pipes.toArray().reduce((acc, pipe) => {
      return pipe.position.x < acc.position.x && pipe.position.x > this.game.width / 2 - this.game.images.pipe.width / 2 ? pipe : acc;
    }, {
      position: {
        x: this.game.width
      }
    });
    const pd = (nextPipe.position.x - this.game.width / 2 + this.game.images.pipe.width / 2) / this.pipeGap;
    const ph = ((nextPipe.slitHeight || -60) + 55) / 150;
    const borderHeight = 0;

    this.flock.forEach(bird => {
      bird.update();
      bird.think(pd, ph);
      bird.sprite.addSpeed(this.game.gravity, 90);

      if (this.game.spriteGroups.pipes.overlap(bird.sprite) || bird.sprite.position.y < borderHeight) {
        this.killBird(bird);
      }
      if (this.game.spriteGroups.foreground.overlap(bird.sprite)) {
        this.killBird(bird);
        bird.sprite.position.y = this.game.height - this.game.images.foreground.height;
        bird.sprite.animation.stop();
      }
    });
    const actualBest = this.flock.filter(bird => !bird.dead)[0];
    this.previousBestBird = actualBest == undefined ? this.previousBestBird : actualBest;
    this.flock = this.flock.filter(bird => bird.sprite.position.x > -this.game.sprites.bird.width);

    if (this.previousPipeDistance < pd && this.flock.filter(bird => !bird.dead).length > 0) {
      this.score++;
    }
    this.previousPipeDistance = pd;

    if (this.flock.length == 0) {
      this.game.changeScreen(this.game.screens.trainScreen, this);
    }
  }
  draw(sketch) {
    sketch.push();

    super.draw(sketch);
    this.flock.forEach(bird => sketch.drawSprite(bird.sprite));
    drawNumber(sketch, this.score, this.game.width / 2, 30, this.game.images.digits);
    sketch.text("Gen", 40, 245);
    drawNumber(sketch, this.gen, 55, 250, this.game.images.digits);
    sketch.text("Flock", 40, 305);
    const alive = this.flock.filter(bird => !bird.dead).length;
    drawNumber(sketch, alive, 55, 310, this.game.images.digits);

    sketch.drawSprite(this.legend.sprite);
    if (!this.showLegend) {
      sketch.drawSprite(this.back.sprite);
    }


    // if (alive == 1) {
    //   sketch.drawSprite(this.versus.sprite);
    // }

    if (this.previousBestBird !== undefined) {
      const x = 30;
      const y = 40;
      const r = 10;

      const input = this.previousBestBird._input;

      sketch.stroke(this.game.textColor);
      for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < this.previousBestBird.weightsDeep.length; j++) {
          const weight = this.previousBestBird.weightsDeep[j][i];
          sketch.strokeWeight(Math.abs(10 * weight));
          sketch.stroke(this.lineColor(weight));
          sketch.line(x, y + i * 3 * r, x + 3 * r, y + 1.5 * r + j * 3 * r);
        }
        sketch.strokeWeight(1);
        sketch.fill(this.nodeColor(this.previousBestBird._input[i], 0.1));
        sketch.noStroke();
        sketch.circle(x, y + i * 3 * r, r);
        sketch.fill(this.game.textColor);
        sketch.text(i + 1, x - 2 * r, y + r / 2 + i * 3 * r);
      }

      const deep = this.previousBestBird.deepLayer1(input);

      for (let i = 0; i < this.previousBestBird.weightsDeep.length; i++) {
        const weight = this.previousBestBird.weightsOut[i];
        sketch.strokeWeight(Math.abs(10 * weight));
        sketch.stroke(this.lineColor(weight));
        sketch.line(x + 3 * r, y + 1.5 * r + i * 3 * r, x + 6 * r, (3 * r * (input.length - 1)) / 2 + y);
        sketch.fill(this.nodeColor(deep[i], 0.1));
        sketch.noStroke();
        sketch.strokeWeight(1);
        sketch.circle(x + 3 * r, y + 1.5 * r + i * 3 * r, r);
      }

      sketch.fill(this.nodeColor(1, 0));
      sketch.circle(x + 3 * r, y + 1.5 * r + this.previousBestBird.weightsDeep.length * 3 * r, r);
      const weight = this.previousBestBird.weightsOut[this.previousBestBird.weightsOut.length - 1];
      sketch.strokeWeight(Math.abs(10 * weight));
      sketch.stroke(this.lineColor(weight));
      sketch.line(x + 3 * r, y + 1.5 * r + this.previousBestBird.weightsDeep.length * 3 * r, x + 6 * r, (3 * r * (input.length - 1)) / 2 + y);
      sketch.noStroke();

      const out = this.previousBestBird.outLayer(deep);
      sketch.fill(this.nodeColor(out, 0));
      sketch.circle(x + 6 * r, (3 * r * (input.length - 1)) / 2 + y, r);

      sketch.fill(this.game.textColor);
      sketch.text("Out", x + 7 * r, (2.25 * r * (input.length - 1)) / 2 + y + r / 2);
      sketch.text("Smartest Bird", x, y - 20);

      sketch.strokeWeight(1);
      sketch.noStroke();
    }

    this.checkFadeIn(sketch);
    this.checkFadeOut(sketch);

    sketch.pop();
    sketch.drawSprite(this.game.sprites.textBox);
    if (this.showLegend) {
      if (this.game.sprites.textBox.position.y > this.legendBoxY) {
        this.game.sprites.textBox.position.y -= 30;
      } else {
        sketch.push();

        if (this.page == 0) {
          sketch.textAlign(sketch.CENTER);
          sketch.text("Training Birds", this.game.width / 2, 115);

          sketch.textAlign(sketch.LEFT);
          // sketch.text("This screen shows a training //", this.game.width / 8, 145);
          sketch.text("This screen shows the training", this.game.width / 8, 135);
          sketch.text("of a two layer artificial neural", this.game.width / 8, 150);
          sketch.text("network.", this.game.width / 8, 165);

          sketch.text("This network has 4 inputs and", this.game.width / 8, 185);
          sketch.text("a bias term. The deep layer has", this.game.width / 8, 200);
          sketch.text("3 neurons and another bias. The", this.game.width / 8, 215);
          sketch.text("output is a single neuron.", this.game.width / 8, 230);

          sketch.text("The network is trained with a", this.game.width / 8, 250);
          sketch.text("genetic algorithm. The best bird", this.game.width / 8, 265);
          sketch.text("is allowed to breed and fill 50%", this.game.width / 8, 280);
          sketch.text("of the population. Variance is", this.game.width / 8, 295);
          sketch.text("introduced by altering the", this.game.width / 8, 310);
          sketch.text("neurons randomly.", this.game.width / 8, 325);

          sketch.text("Let the birds train for a while", this.game.width / 8, 345);
          sketch.text("and after some generations they", this.game.width / 8, 360);
          sketch.text("will be better than you XD", this.game.width / 8, 375);

        } else {
          sketch.textAlign(sketch.CENTER);
          sketch.text("Neurons:", this.game.width / 2, 120);
          sketch.text("Positive", this.game.width / 4, 165);
          sketch.text("Negative", this.game.width / 2, 165);
          sketch.text("Transition", this.game.width / 4 * 3, 165);
          sketch.text("Weights:", this.game.width / 2, 195);
          sketch.text("Highly Positive", 90, 225);
          sketch.text("Highly Negative", 90, 255);
          sketch.text("Weakly Positive", 230, 225);
          sketch.text("Weakly Negative", 230, 255);
          sketch.text("Input/Output:", this.game.width / 2, 280);
          sketch.textAlign(sketch.LEFT);
          sketch.text("1: Pipe Distance", 50, 300);
          sketch.text("2: Pipe Height", 50, 315);
          sketch.text("3: Bird Velocity", 50, 330);
          sketch.text("4: Bird Height", 50, 345);
          sketch.text("5: Bias", 50, 360);
          sketch.text("Out: Output (Flap Wings)", 50, 375);

          sketch.fill(this.nodeColor(1, 0.1));
          sketch.circle(80, 140, 10);
          sketch.fill(this.nodeColor(-1, 0.1));
          sketch.circle(160, 140, 10);
          sketch.fill(this.nodeColor(0, 0.1));
          sketch.circle(240, 140, 10);

          const row1 = 210;
          const row2 = 240;
          sketch.strokeWeight(5);
          sketch.stroke(this.lineColor(1));
          sketch.line(75, row1, 105, row1);
          sketch.strokeWeight(1);
          sketch.line(215, row1, 245, row1);
          sketch.stroke(this.lineColor(-1));
          sketch.line(215, row2, 245, row2);
          sketch.strokeWeight(5);
          sketch.line(75, row2, 105, row2);
        }
        sketch.pop();
        sketch.drawSprite(this.arrowBack.sprite);
        sketch.drawSprite(this.arrowNext.sprite);
      }
    } else {
      if (this.game.sprites.textBox.position.y < this.legendBoxResting) {
        this.game.sprites.textBox.position.y += 30;
      }
    }
  }
  killBird(bird) {
    if (!bird.dead) {
      bird.sprite.addSpeed(this.game.speed, 180);
    }
    bird.dead = true;
    // bird.sprite.rotation = 90;
  }
  nodeColor(value, thresh) {
    if (value >= thresh) {
      return "#20AA20AA";
    } else if (value >= -thresh) {
      return "#AAAA20AA";
    } else {
      return "#AA2020AA";
    }
  }
  lineColor(value) {
    if (value >= 0) {
      return "#206620";
    } else {
      return "#662020";
    }
  }
}

class ChallengeScreen extends SingleScreen {
  init(sketch, previousScreen) {
    super.init(sketch);
    this.previousScreen = previousScreen;
    console.log(previousScreen);
  }
  update(sketch) {
    super.update(sketch);
  }
  draw(sketch) {
    super.draw(sketch);
  }
}

class SmartBird extends Bird {
  constructor(sprite) {
    super(sprite);
    this.flapStrength = 6;
    this.weightsDeep = [ // Deep layer
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    ];
    this.weightsOut = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
  }
  think(pd, ph) {
    const input = this.input(pd, ph);
    const deep = this.deepLayer1(input);
    const out = this.outLayer(deep);
    if (out >= 0) { // If output neuron is active, flap wings
      this.flap(this.flapStrength);
    }
  }
  input(pd, ph) {
    const bv = -this.sprite.velocity.y / 30;
    const bh = (this.sprite.position.y - 240) / 240;
    this._input = [
      pd, // Pipe distance
      ph, // Pipe height
      bv, // Bird velocity
      bh, // Bird height
      1, // Bias
    ];
    return this._input;
  }
  deepLayer1(input) {
    return this.weightsDeep.map(ws => Math.tanh(ws.map((w, index) => w * input[index]).reduce((acc, cur) => acc + cur))).concat([1]);
  }
  outLayer(input) {
    return Math.tanh(this.weightsOut.map((w, index) => w * input[index]).reduce((acc, cur) => acc + cur));
  }
}

export function screens(game) {
  return {
    menuScreen: new MenuScreen(game),
    // menuScreen: new TrainScreen(game),
    // menuScreen: new PipesScreen(game),
    // menuScreen: new HighScoresScreen(game),
    // menuScreen: new CreditsScreen(game),
    singleScreen: new SingleScreen(game),
    gameOverScreen: new GameOverScreen(game),
    highScoresScreen: new HighScoresScreen(game),
    creditsScreen: new CreditsScreen(game),
    trainScreen: new TrainScreen(game),
    challengeScreen: new ChallengeScreen(game),
  };
}

function drawNumber(sketch, number, x, y, images) {
  number = Math.round(number).toString().split("");
  const numberWidth = images[0].width;
  const spacing = 30;
  const half = number.length / 2;
  number.forEach((digit, index) => {
    digit = parseInt(digit);
    sketch.image(images[parseInt(digit)], x - (half - 0.5 - index) * spacing - numberWidth / 2, y);
  });
}

function ordinalSuffixOf(number) {
  var unity = number % 10,
    ten = number % 100;
  if (unity == 1 && ten != 11) {
    return number + "st";
  }
  if (unity == 2 && ten != 12) {
    return number + "nd";
  }
  if (unity == 3 && ten != 13) {
    return number + "rd";
  }
  return number + "th";
}

function randomBm(mean, variance) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return mean + Math.sqrt(variance * -2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
