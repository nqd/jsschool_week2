let fs = require('fs')
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

let options = {}

let init = (ops) => {
  options.rootDir = ops.rootDir
}

let setContentPath = (req, res, next) => {
  let contentPath = path.join(options.rootDir, req.url)
  if (contentPath.indexOf(options.rootDir) !== 0) {
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

let setHeaders = (req, res, next) => {
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

let read = (req, res, next) => {
  nodeify(async() => {
    let stat = req.stat
    let contentPath = req.contentPath

    if (stat.isDirectory()) {
      // if request for zip
      if (req.headers['accept'] === 'application/x-gtar') {
        let archive = archiver('tar')
        archive.pipe(res);
        archive.bulk([
            { expand: true, cwd: contentPath, src: ['**'] }
        ])
        return archive.finalize()
      }
      let files = await fs.promise.readdir(contentPath)
      return res.json(files)
    }
    return fs.createReadStream(contentPath).pipe(res)
  })().catch(next)
}

let remove = (req, res, next) => {
  nodeify(async() => {
    let stat = req.stat
    if (stat.isDirectory()) {
      await rimraf.promise(req.contentPath)
    } else {
      await fs.promise.unlink(req.contentPath)
    }
    return res.end()
  })().catch(next)
}

let create = (req, res, next) => {
  let stat = req.stat
  let contentPath = req.contentPath
  let isDir = req.isDir
  let dirPath = req.dirPath

  if (stat) return res.send(405, 'Content existed')
  nodeify(async() => {
    await mkdirp.promise(dirPath)
    if (!isDir) req.pipe(fs.createWriteStream(contentPath))
    res.end()
  })().catch(next)
}

let update = (req, res, next) => {
  let stat = req.stat
  let contentPath = req.contentPath
  let isDir = req.isDir
  let dirPath = req.dirPath

  if (!stat) return res.send(404, 'Not found')
  if (isDir) return res.send(405, 'Folder is uneditable')
  nodeify(async() => {
    req.pipe(fs.createWriteStream(contentPath))
    res.end()
  })().catch(next)
}

module.exports = {
  init: init,
  create: create,
  read: read,
  update: update,
  remove: remove,
  setHeaders: setHeaders,
  setContentPath: setContentPath
}
