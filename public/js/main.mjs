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
import * as gl from './gameloop.mjs';
const VERSION = "v1.0";

document.addEventListener('DOMContentLoaded', function() {
  try {
    const app = firebase.app();

    const uiConfig = {
      signInSuccessUrl: "/",
      signInFlow: "redirect",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      ],
      privacyPolicyUrl: "/privacy.html"
    };
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start(".firebaseui-auth-container", uiConfig);

    if (ui.isPendingRedirect()) {
      document.querySelector(".pending-div").classList.toggle("display-none");
    } else {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          db.user = {
            uid: user.uid,
            displayName: user.displayName
          };
          document.querySelector(".name-div").classList.toggle("display-none");
          document.querySelector(".name-span").textContent = user.displayName;
        } else {
          document.querySelector(".firebaseui-auth-container").classList.toggle("display-none");
        }
      }, function(error) {
        console.log(error);
      });
      const db = firebase.firestore();
      const game = new gl.Game(db);

      window.logoff = () => {
        document.querySelector(".name-div").classList.toggle("display-none");
        firebase.auth().signOut().then(() => {
          // Sign-out successful.
        },
        (error) => {
          // An error happened.
        });
      };
    }
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener("keydown", function(event) {
  if ([" ", "ArrowDown",  "ArrowUp"].includes(event.key)) {
    event.preventDefault();
  }
}, false);
