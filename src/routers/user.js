const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        const isSub = (user.sub >= Date.now())
        res.send({ isSub, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    if(req.user.sub && (req.user.sub >= Date.now())) res.send({newSubscriber: false, status: 200})
    else if(req.user.sub && (req.user.sub < Date.now())) res.send({ newSubscriber: false, status: 402 })
    else if(!req.user.sub) res.send({ newSubscriber: true, status: 402 })
})

module.exports = router