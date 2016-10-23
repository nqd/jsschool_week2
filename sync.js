let chokidar = require('chokidar')
let nssocket = require('nssocket')

let options = {}

const init = (ops) => {
  options.rootDir = ops.rootDir
}

const start = () => {
  chokidar.watch(options.rootDir, {ignored: /[\/\\]\./}).on('all', (event, path) => {
    console.log({
      event: event,
      path: path,
      time: new Date()
    })
  })
}

module.exports = {
  init: init,
  start: start
}
