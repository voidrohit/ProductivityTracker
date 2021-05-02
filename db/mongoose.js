const mongoose = require('mongoose')

const mongodb_uri = 'mongodb+srv://voidrohit:Rks&18158920@cluster0.oiqtt.mongodb.net/Tracker?retryWrites=true&w=majority'
const local_mongodb_uri = 'mongodb://127.0.0.1:27017/Productivity'
mongoose.connect(mongodb_uri, {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify: false
})
