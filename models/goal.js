const mongoose = require('mongoose')

const Goal = mongoose.model('Goal', {
    goals: {
        type: String,
        trim: true
    },
    flag: {
        type: String,
        default: "goal"
    }
})

module.exports = Goal