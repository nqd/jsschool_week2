
let nssocket = require('nssocket')
let url = require('url')
let request = require('request')
const ROOT_DIR = process.cwd()
let argv = require('yargs').argv

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

let options = {
  url: url.format({
    protocol: 'http',
    hostname: hostname,
    port: port
  }),
  headers: { Accept: 'application/x-gtar' }
}
request(options, 'http://127.0.0.1:8000/').pipe(tarExtractStream)