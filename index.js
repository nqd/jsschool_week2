#!/usr/bin/env babel-node

let express = require('express')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let argv = require('yargs').argv

let crud = require('./crud')
let sync = require('./sync')

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = process.cwd()

const rootDir = argv.dir || ROOT_DIR

let app = express()
// middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

crud.init({
  rootDir: rootDir
});

sync.init({
  rootDir: rootDir
})

sync.start()

app.get('*', crud.setContentPath, crud.setHeaders, crud.read)
app.head('*', crud.setContentPath, crud.setHeaders)
app.delete('*', crud.setContentPath, crud.setHeaders, crud.remove)
app.post('*', crud.setContentPath, crud.create)
app.put('*', crud.setContentPath, crud.update)

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})
