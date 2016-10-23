
let nssocket = require('nssocket')
let url = require('url')
let request = require('request')
let argv = require('yargs').argv
let unzip = require('unzip')

const ROOT_DIR = process.cwd()

const rootDir = argv.dir || ROOT_DIR

let outbound = new nssocket.NsSocket({
  reconnect: true,
  type: 'tcp4',
});

outbound.data(['message', 'sync'], (data) => {
  console.log(data);
})

outbound.connect(8001)

// when bootup, download the root dir
const hostname = 'localhost'
const port = 8000

const options = {
  url: url.format({
    protocol: 'http',
    hostname: hostname,
    port: port
  }),
  headers: { Accept: 'application/x-gtar' }
}
request(options).pipe(unzip.Extract({path: 'clientDir'}))
