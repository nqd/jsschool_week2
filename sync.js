let chokidar = require('chokidar')
let nssocket = require('nssocket')

let nodeify = require('bluebird-nodeify')
require('songbird')

let options = {}
let sockets = []


/*
 * initialize the sync function
 */
const init = (ops) => {
  options.rootDir = ops.rootDir
}

const start = () => {
  const server = nssocket.createServer(socket => {
    sockets.push(socket)
  })
  server.promise.listen(8001);

  // watch for file changes
  chokidar.watch(options.rootDir, { ignored: /[\/\\]\./ })
  .on('all', (event, path) => {
    const infor = {
      event: event,
      path: path,
      time: new Date()
    }
    console.log(infor)
    sockets.forEach(socket => {
      socket.send(['message', 'sync'], infor)
    })
  })
  // check for file/folder status
}

module.exports = {
  init: init,
  start: start
}
