import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { addComment, deleteComment, getAllBlogs, getAllComments, getSavedBlogs, getSingleBlog, saveBlog } from '../controllers/blog.js';


const router = express.Router();

router.get("/blog/all", getAllBlogs)
router.get("/blog/:id", getSingleBlog)
router.post("/comment/:id", isAuth, addComment)
router.get("/comments/:id", getAllComments)
router.get("/comment/:id", getAllComments)
router.delete("/comment/:id", isAuth, deleteComment)
router.post("/save/:blogid", isAuth, saveBlog)
router.get("/blog/saved/all", isAuth, getSavedBlogs)



export default router