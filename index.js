require('dotenv').config()
const model = require("./models/users") 
const morgan = require('morgan')
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('body', (request, response) => {
  if (request.method === 'POST'){
    return JSON.stringify(request.body)
  }
  return " "
})

let persons = [
  { 
    id: 1,
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
]

app.get("/api/persons", (request, response) => {
    model.find({}).then(persons => response.send(persons)).catch(error => response.send())
})

app.get("/info", (request, response) => {
  model.find({}).then(persons => response.send(response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`))).catch(error => response.send(error))    
})

app.get("/api/persons/:id", (request, response) => {
  model.findById(request.params.id).then(person => {    
    if (person){
        return response.send(person)
    }
    return response.status(404).end()
  }).catch(error => response.send(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  model.findByIdAndRemove(request.params.id).then(result => {
    if (result){
      return response.status(204).end()
    }
    response.status(404).end()
  }).catch(error => {
    next(error)
  })
})

app.post("/api/persons", (request, response) => {
  const person = new model(request.body)
  if (!(person.name) || !(person.number)){
    return response.status(404).send({
      error : "Please make sure that both the name and numbers are entered."
    })
  }
  person.save().then(result => response.send(`<p>added ${result.name} successfully to phonebook`)).catch(error => response.send('Could not add', error))
  
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body
  const person = {
    name : body.name,
    number : body.number 
  } 
  model.findByIdAndUpdate(request.params.id, person, {new: true}).then(updatedPerson => {
    response.status(204).send(updatedPerson)
  }).
    catch(error => next(error))
})

app.use((error, request, response, next) => {
  console.log(error)
  if (error.name === "CastError"){
    response.status(400).send({
      error : "Malformatted ID"
    })
  }
  else{
    response.send(500).end()
  }
  next(error)
})
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Application started in port ${PORT}`)
})