#!/usr/bin/env babel-node

let fs = require('fs')
let express = require('express')
// let PromiseRouter = require('express-promise-router')
// let trycatch = require('trycatch')
// let bodyParser = require('body-parser')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let path = require('path')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp-promise')
let archiver = require('archiver')
let argv = require('yargs').argv

let crud = require('./crud')

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = process.cwd()

let rootDir = argv.dir || ROOT_DIR

let app = express()
// middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

function setContentPath(req, res, next) {
  let contentPath = path.join(rootDir, req.url)
  if (contentPath.indexOf(rootDir) !== 0) {
    return res.send(400, 'Invalid path')
  }
  req.contentPath = contentPath

  let endWithSlash = contentPath.charAt(contentPath.length - 1) === path.sep
  let hasExt = path.extname(contentPath) !== ''
  let isDir = endWithSlash || !hasExt
  let dirPath = isDir ? contentPath : path.dirname(contentPath)
  req.isDir = isDir
  req.dirPath = dirPath

  fs.promise.stat(contentPath)
  .then(stat => req.stat = stat, () => req.stat = null)
  .nodeify(next)
}

function setHeaders(req, res, next) {
  nodeify(async() => {
    let contentPath = req.contentPath
    let stat = req.stat

    if (!stat) {
      return res.send(404, 'Invalid path')
    }

    // since we stream the file, lets set the content length
    if (!stat.isDirectory()) {
      res.setHeader('Content-Length', stat.size)
      res.setHeader('Content-Type', mime.lookup(contentPath))
    }
    next()
  })().catch(next)
}

app.get('*', setContentPath, setHeaders, crud.read)

app.head('*', setContentPath, setHeaders)

app.delete('*', setContentPath, setHeaders, crud.remove)

app.post('*', setContentPath, crud.create)

app.put('*', setContentPath, crud.update)

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})
