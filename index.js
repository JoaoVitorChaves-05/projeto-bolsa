const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const bodyParser = require('body-parser')
const server = require('./server.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// USER
app.post('/api/user', (req, res) => {
    const { username, email, password } = req.body

    if (username && email && password) {
        server.createUser({ username, email, password })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/user', (req, res) => {
    const {token} = req.query

    if (token) {
        const result = server.getUser({ token })

        res.json(result)
    }
})

app.put('/api/user', (req, res) => {
    const { token } = req.body

    const result = server.updateUser({token, dataToUpdate: req.body})

    res.json(result)
})

app.delete('/api/user', (req, res) => {
    const { token } = req.body

    const result = server.deleteUser({token})

    res.json(result)
})

// PLACE
app.post('/api/place', (req, res) => {
    const { placename, email, password, photos } = req.body

    if (placename && email && password && photos.lenght) {
        server.createPlace({ placename, email, password, photos })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/place', (req, res) => {
    const { id } = req.query

    if (id) {
        const result = server.getPlace({ id })

        res.json(result)
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/places', (req, res) => {
    
})

app.put('/api/place', (req, res) => {
    const { token } = req.body

    const result = server.updatePlace({token, dataToUpdate: req.body})

    res.json(result)
})

app.delete('/api/place', (req, res) => {
    const { token } = req.body

    if (token) {
        server.deletePlace({ token })
        res.json({
            status: 'success'
        })
    }

})

// COMMENT
app.post('/api/comment', (req, res) => {
    const { token, id_place, comment, grade, timestemp } = req.body

    if (token && id_place && comment && grade && timestemp) {
        server.createComment({ token, id_place, comment, grade, timestemp })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.get('/api/comment', (req, res) => {
    const { id_place } = req.query

    if (id_place) {
        const result = server.getComments({id_place})
        res.json(result)
    }

    res.json({ status: 'error'})
})

app.put('/api/comment', (req, res) => {
    const { token, id_comment, comment, grade } = req.body

    if (token && id_comment && comment) {
        server.updateComment({ id_comment, token, comment, grade })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.delete('/api/comment', (req, res) => {
    const { token, id_comment } = req.body

    if (token && id_comment) {
        server.deleteComment({ id_comment, token })

        res.json({
            status: 'success'
        })
    }

    res.json({
        status: 'error'
    })
})

app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT)
})