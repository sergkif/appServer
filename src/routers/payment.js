const express = require('express')
const User = require('../models/User')
const Merchant = require('../models/Merchant')
const auth = require('../middleware/auth')
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk')
const bcrypt = require('bcryptjs')

const router = express.Router()


router.post('/add', auth, async function(req, res, next) {
  const SECRET_KEY = 'eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6InZkNmx5ZS0wMCIsInVzZXJfaWQiOiI3OTYxOTMwODQyNSIsInNlY3JldCI6IjA5ZmMwYjE4ODZiYmQ4ZjJjYzUwYTZjYmI5ZDlkYjAyNWY4MDM2MTM2MjZkY2NlMGViZDkyNTFjYTFkNDlkN2QifX0==48e7qUxn9T7RyYE1MVZswX1FRSbE6iyCj2gCRwwF3Dnh5XrasNTx3BGPiMsyXQFNKQhvukniQG8RTVhYm3iPy5LmVEPebMfiBKZqiXAf62GiT5B9WEt9oUZ5LWNQgMNhqxmepQtZvG7DiSj8ptKCtxEtobU1M3G3CGCB8wHKijPT9k4z15sRNDUSCASLM'
      , email = req.user.email
      , Time = new Date();
  const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);
  
  const billId = bcrypt.hash(email + Time.getTime());
    // const billId = '893794793973'
  
  const expirationDateTime = Time.setDate(Time.getDate() + 1);
  
  const fields = {
    amount: 1.00, // price
    currency: 'RUB',
    comment: 'test',
    expirationDateTime: expirationDateTime,
    email: email,
    successUrl: 'https://freeapps2019.herokuapp.com/payments/check'
  };
  
  qiwiApi.createBill( billId, fields ).then( data => {
    
    Merchant.findOne({email}).then( merchant => {
      
      if(data.status.value === 'WAITING'){
        
        if(merchant){
          merchant.billId = billId;
  
          merchant.save().then(() => {
            
            res.status(200).send('Success');
          }).catch( err => {
            
            console.log(err);
            res.status(500).send('Failed (not saved)');
          })
        } else{
          const merchant = new Merchant({
              billId,
              email
          });
    
          merchant.save().then(function () {
              res.status(201).send('Success');
          }).catch( err => {
              console.log(err);
              res.status(500).send('Failed (not saved)');
          })
        }
      } else{
        res.status(500).send('Failed (not sent)');
      }
    });
  }).catch( err => {
    
    console.log(err);
    res.status(500).send('Failed (error)');
  });
  
});

module.exports = router;