import {Router} from 'express'
// const router = express.Router();
import { signUp, login, logOut, getOne, createPin } from '../controllers/userController.js'
import authorization from '../middleware/authorization.js'
import validation from '../validation/validation.js'
// const upload = require('../utils/multer');

const router = Router()

router.post('/signup', validation, signUp)

router.post('/login', login)

router.post('/logout', authorization, logOut);

router.get('/getone', authorization, getOne);

router.put('/createpin', authorization, createPin)

export default router;   