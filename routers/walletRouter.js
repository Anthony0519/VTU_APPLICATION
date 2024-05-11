import {Router} from 'express'
import authorization from '../middleware/authorization.js'

const router = Router();
import { fundWallet, callBackUrl, getBanks, bankDetails, withdrawfunds } from '../controllers/walletController.js'

router.post('/deposit', fundWallet);
router.post('/paystack/callback', callBackUrl);
router.post('/bank_details', authorization, bankDetails);
router.post('/withdrawfunds', authorization, withdrawfunds);
router.get('/getbanks', getBanks);

export default router;