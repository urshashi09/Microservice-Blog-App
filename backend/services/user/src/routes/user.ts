import express from 'express';
import { getProfile, login, myProfile, updateProfilePic, updateUser } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';

const router = express.Router();

router.post('/login', login)
router.get('/myprofile', isAuth, myProfile)
router.get('/profile/:id', isAuth, getProfile)
router.put('/update', isAuth, updateUser)
router.post('/updateprofilepic', isAuth,uploadFile, updateProfilePic)


export default router