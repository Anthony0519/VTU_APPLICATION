const express = require('express');
const authorization = require('../middleware/authorization');

const router = express.Router();
const { fundWallet, callBackUrl } = require('../controllers/walletController');

router.post('/deposit', authorization, fundWallet);
router.post('/paystack/callback', callBackUrl);

module.exports = router;   