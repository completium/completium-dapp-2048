import Prando from "prando";

/* key used to encode score; KEEP IT SECRET! */
const privateKey = '';

export function GameServer() {
  this.seeds  = new Object();
  this.rngs   = new Object();
};

GameServer.prototype.newSession = async function () {
  var id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  // set seed
  this.seeds[id]  = Math.random();
  this.rngs[id]   = new Prando(this.seeds[id]);
  return new Promise((resolve) => {
    resolve(id);
  });
};

GameServer.prototype.next = async function (id) {
  return new Promise((resolve) => {
    resolve(this.rngs[id].next());
  })
}