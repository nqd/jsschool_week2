let fs = require('fs').promise
let express = require('express')
let PromiseRouter = require('express-promise-router')
let morgan = require('morgan')
let trycatch = require('trycatch')
let bodyParser = require('body-parser')
require('songbird')

let app = express()

app.use(morgan('dev'))

app.get('*', (req, res) => {
  console.log('get')
})

app.head('*', (req, res) => {
  console.log('head')
})

app.listen(8000)
