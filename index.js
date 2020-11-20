const express = require('express') //import pkg

const app = express() //initial

const port = 8000 //initial port

app.listen(port, () => {
    console.log(`Server is running at ${port}`)
}) //menyalakan server local:port


app.get("/",(req, res) => {
    res.send(`Selamat datang di Express`)
})

