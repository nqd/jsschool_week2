#!/usr/bin/env babel-node

let nssocket = require('nssocket')
let url = require('url')
let request = require('request')
let argv = require('yargs').argv
let tar = require('tar')
let path = require('path')

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

function onError(err) {
  console.error('An error occurred:', err)
}

function onEnd() {
  console.log('Extracted!')
}
let extractor = tar.Extract({ path: path.join(__dirname, rootDir) })
  .on('error', onError)
  .on('end', onEnd);
request(options).pipe(extractor)
