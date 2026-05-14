import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';
import { createBlog, deleteBlog, updateBlog } from '../controller/blog.js';

const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog)
router.post("/blog/update/:id", isAuth, uploadFile, updateBlog)
router.delete("/blog/delete/:id", isAuth, deleteBlog)


export default router
