const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()
const options = {
    useNewUrlParser: true, useUnifiedTopology: true,
};

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URL, options)
        .then(() => {
            console.log('Connected to MongoDB successfully');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
}

module.exports = {connectDB}
