// require package used in the project
const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
//const restaurantList = require('./restaurant.json')

// setting database connection
mongoose.connect('mongodb://localhost/restaurant-list', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
const Restaurant = require('./models/restaurant')

// testing connection status
db.once('open', () => {
  console.log('mongoDB connected')
})

db.on('error', () => {
  console.log('mongoDB failed to connect  ')
})

// setting template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))

// route setting
// putting database data into index template engine
app.get('/', (req, res) => {
  Restaurant.find()
    .lean()
    .sort({ id: 'asc' })
    .then(restaurants => res.render('index', { restaurants }))
    .catch(error => console.log('failed to render the data from mongodb'))
})

// rendering show page
app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  Restaurant.findOne({ id: req.params.id })
    .lean()
    .then(restaurant => res.render('show', { restaurant }))
})

app.get('/search', (req, res) => {
  let keyword = req.query.keyword
  Restaurant.find({
    '$or': [
      { name: { $regex: keyword, $options: 'si' } },
      { category: { $regex: keyword, $options: 'si' } }
    ]
  })
    .lean()
    .then(restaurants => res.render('index', { restaurants }))
})

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})