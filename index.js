const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser')
const server = require('./server.js')
const cors = require('cors')
const url = 'http://localhost:3000/'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
/*
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
    next()
})
*/
app.use(cors())

// USER
app.post('/api/user', async (req, res) => {
    const { username, email, password } = req.body
    console.log(req.body)
    
    if (username && email && password) {
        await server.createUser({ username, email, password })
    }

    res.json({ success: true })
})

app.get('/api/user', async (req, res) => {
    const {token} = req.query

    if (token) {
        const result = await server.getUser({ token })

        res.json(result)
    }
})

app.get('/api/users', async (req, res) => {
    const result = await server.getUsers()
    res.json(result)
})

app.put('/api/user', async (req, res) => {
    const { token } = req.body

    try {
        const result = await server.updateUser({token, dataToUpdate: req.body.dataToUpdate})

        res.json(result)
    } catch (err) {
        console.log(err)
        res.json({status: false})
    }
    
})

app.delete('/api/user', async (req, res) => {
    const { token } = req.body
    console.log(token)

    try {
        const result = await server.deleteUser({token})
        console.log(result)
        res.json(result)
    } catch (err) {
        console.log(err)
        res.json({status: false})
    }
})

// PLACE
app.post('/api/place', async (req, res) => {
    const { placename, email, password, photos, address, city} = req.body

    if (placename && email && password && city) {
        await server.createPlace({ placename, email, password, photos, address, city })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/place', async (req, res) => {
    const { id } = req.query

    if (id) {
        const result = await server.getPlace({ id })

        res.json(result)
    }
})

app.get('/api/places', async (req, res) => {
    const { city } = req.query
    const result = await server.getPlaces({city})
    res.json(result)
})

app.put('/api/place', async (req, res) => {
    const { token } = req.body

    const result = await server.updatePlace({token, dataToUpdate: req.body})

    res.json(result)
})

app.delete('/api/place', async (req, res) => {
    const { token } = req.body

    if (token) {
        await server.deletePlace({ token })
        res.json({
            status: 'success'
        })
    }
})

// COMMENT
app.post('/api/comment', async (req, res) => {
    const { token, id_place, comment, grade, timestemp } = req.body

    if (token && id_place && comment && grade && timestemp) {
        await server.createComment({ token, id_place, comment, grade, timestemp })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/comment', async (req, res) => {
    const { id_place } = req.query

    if (id_place) {
        const result = await server.getComments({id_place})
        res.json(result)
    }

    res.json({ status: 'error'})
})

app.put('/api/comment', async (req, res) => {
    const { token, id_comment, comment, grade } = req.body

    if (token && id_comment && comment) {
        await server.updateComment({ id_comment, token, comment, grade })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.delete('/api/comment', async (req, res) => {
    const { token, id_comment } = req.body

    if (token && id_comment) {
        await server.deleteComment({ id_comment, token })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

// AUTHENTICATION
app.post('/api/auth/:type', async (req, res) => {
    const { type } = req.params
    const credentials = req.body
    let result = {}

    if (type === 'user') {
        result = await server.authenticateUser(credentials)
    } else if (type === 'place') {
        result = await server.authenticatePlace(credentials)
    } else if (type === 'token') {
        result = await server.authenticateToken(credentials)
    }

    res.json(result)
})


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/teste.html')
})

app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT)
})
