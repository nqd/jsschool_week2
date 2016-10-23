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


let app = express()
// middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

crud.init({
  rootDir: (argv.dir || ROOT_DIR)
});

app.get('*', crud.setContentPath, crud.setHeaders, crud.read)

app.head('*', crud.setContentPath, crud.setHeaders)

app.delete('*', crud.setContentPath, crud.setHeaders, crud.remove)

app.post('*', crud.setContentPath, crud.create)

app.put('*', crud.setContentPath, crud.update)

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})
