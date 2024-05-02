import {Router} from 'express'
import authorization from '../middleware/authorization.js'

const router = Router();
import { fundWallet, callbackUrl, getBanks, bankDetails, withdrawfunds } from '../controllers/walletController.js'

router.post('/deposit', authorization, fundWallet);
router.post('/paystack/callback', callbackUrl);
router.post('/bank_details', authorization, bankDetails);
router.post('/withdrawfunds', authorization, withdrawfunds);
router.get('/getbanks', getBanks);

export default router;