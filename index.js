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

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = process.cwd()

let app = express()

// middleware
app.use(morgan('dev'))

function setContentPath(req, res, next) {
  let contentPath = path.join(ROOT_DIR, req.url)
  if (contentPath.indexOf(ROOT_DIR) !== 0) {
    return res.send(400, 'Invalid path')
  }
  req.contentPath = contentPath
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

app.get('*', setContentPath, setHeaders, (req, res, next) => {
  nodeify(async() => {
    let stat = req.stat
    let contentPath = req.contentPath

    if (stat.isDirectory()) {
      let files = await fs.promise.readdir(contentPath)
      return res.json(files)
    }
    return fs.createReadStream(contentPath).pipe(res)
  })().catch(next)
})

app.head('*', setContentPath, setHeaders)

app.delete('*', setContentPath, setHeaders, (req, res, next) => {
  nodeify(async() => {
    let stat = req.stat
    if (stat.isDirectory()) {
      await rimraf.promise(req.contentPath)
    } else {
      await fs.promise.unlink(req.contentPath)
    }
    return res.end()
  })().catch(next)
})

app.post('*', setContentPath, (req, res, next) => {
  let stat = req.stat
  let contentPath = req.contentPath

  if (stat) return res.send(405, 'Content existed')
  let endWithSlash = contentPath.charAt(contentPath.length - 1) === path.sep
  let hasExt = path.extname(contentPath) !== ''
  let isDir = endWithSlash || !hasExt
  let dirPath = isDir ? contentPath : path.dirname(contentPath)
  console.log(isDir)
  console.log(dirPath)
});

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})

