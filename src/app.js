const express = require('express')
const userRouter = require('./routers/user')
const paymentRouter = require('./routers/payment')
var cors = require('cors')
const port = process.env.PORT
require('./db/db')


const app = express()

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use('/payments', paymentRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})