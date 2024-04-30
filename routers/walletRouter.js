const express = require('express');
const authorization = require('../middleware/authorization');

const router = express.Router();
const { fundWallet, callbackUrl } = require('../controllers/walletController');

router.post('/deposit', authorization, fundWallet);
router.post('/paystack/callback', callbackUrl);

module.exports = router;   