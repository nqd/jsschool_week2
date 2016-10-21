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

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = process.cwd()

let app = express()

// middleware
app.use(morgan('dev'))

function setHeaders(req, res, next) {
  nodeify(async() => {
    let contentPath = path.join(ROOT_DIR, req.url)
    req.contentPath = contentPath
    if (contentPath.indexOf(ROOT_DIR) !== 0) {
      return res.send(400, 'Invalid path')
    }
    let stat
    try {
      stat = await fs.promise.stat(contentPath)
    }
    catch(e) {
      return res.send(404, 'invalide path')
    }
    req.stat = stat

    // since we stream the file, lets set the content length
    if (!stat.isDirectory()) {
      res.setHeader('Content-Length', stat.size)
    }
    next()
  })().catch(next)
}

app.get('*', setHeaders, (req, res, next) => {
  nodeify(async() => {
    let stat = req.stat
    let contentPath = req.contentPath

    if (stat.isDirectory()) {
      let files = await fs.promise.readdir(contentPath)
      return res.json(files)
    }
    res.setHeader('Content-Type', mime.lookup(contentPath))
    fs.createReadStream(contentPath).pipe(res)
  })().catch(next)
})

app.head('*', setHeaders)

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})

