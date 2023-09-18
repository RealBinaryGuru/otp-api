const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const {sendSMS} = require("./sendsms");
const {generateOTP} = require("./generateOTP");
const {connectDB} = require("./connectDB");
const User = require('./models/User')
const app = express();

connectDB()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    const users = User.find().then((data) => {
        const datetime = moment(data[0].createdAt, 'YYYY-MM-DDTHH:mm:ss');
        const timestampInSeconds = datetime.unix();
        console.log('Datetime:', datetime.format('YYYY-MM-DD HH:mm:ss'));
        console.log('Unix Timestamp (in seconds):', timestampInSeconds);

        res.status(200).json({'data': data})

    }).catch((err) => {
        res.json({'message': `Error: ${err}`})
    });
})


app.post('/send-otp', async (req, res) => {
    const {name, phone} = req.body;
    const otp = generateOTP(6);

    const user = await User.findOne({
        phone: phone
    })

    if (!user || user.length == 0) {
        const newUser = new User({name: name, phone: phone, otp: otp});
        sendSMS({
            "sender": "SMS Info",
            "to": phone,
            "content": `your otp verification code is ${otp}`
        })
        newUser.save().then(() => {
            console.log("User has been created and send otp");
            res.status(200).json({'message': 'Otp has been send successfully'})
        }).catch((err) => {
            console.log(err)
            res.json({'message': `Error: ${err}`})
        });
    } else {
        const currentDate = moment()
        const previousDate = moment(user.updatedAt, 'YYYY-MM-DDTHH:mm:ss');
        const timeDifferenceSeconds = currentDate.diff(previousDate, 'seconds');

        if (timeDifferenceSeconds < 60) {
            res.json({'message': 'Otp not expire yet'})
        } else {
            sendSMS({
                "sender": "SMS Info",
                "to": phone,
                "content": `your otp verification code is ${otp}`
            })
            user.otp = otp;
            user.updatedAt = new Date();
            user.save().then(() => {
                console.log("User has been updated and send otp");
                res.status(200).json({'message': 'Otp has been send successfully'})
            }).catch((err) => {
                console.log(err)
                res.json({'message': `Error: ${err}`})
            });
        }
    }

})

app.post('/verification_otp', (req, res) => {
    const user = User.findOne({
        phone: req.body.phone
    }).then((data) => {
        if (data.otp != req.body.otp) {
            res.json({
                "message": "Otp is incorrect"
            });
        }
        res.json({
            "message": "Login successfully"
        });
    }).catch((err) => {
        console.log(err)
        res.json({'message': `Error: ${err}`})
    })
})


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} http://localhost:${port}`);
})