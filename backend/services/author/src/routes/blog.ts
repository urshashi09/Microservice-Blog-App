import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';
import { createBlog } from '../controller/blog.js';

const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog)


export default router