const axios = require("axios");
const dotenv = require('dotenv')
dotenv.config()
const sendSMS = (body) => {
    axios.post(process.env.SMS_PROVIDER, body, {
        params: {
            private_key: process.env.PRIVATE_KEY
        }, headers: {
            'X-Secret': process.env.SECRET_KEY
        }
    }).then(response => {
        console.log('POST Response:', response);
    }).catch(error => {
        // Handle errors
        console.error('POST Error:', error);
    });
}
module.exports = {sendSMS}


