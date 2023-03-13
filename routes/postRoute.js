import express from 'express';
import {
  createPost,
  getAllPosts,
  comment,
  savePost,
  deletePost,
} from '../controllers/postController.js';
import { uploadImages, listImages } from '../controllers/uploadsController.js';
import imageMiddleware from '../middlewares/imgMiddleware.js';
import authMiddleware from '../middlewares/auth.js';
import { getReacts, reactToPost } from '../controllers/reactController.js';

const router = express.Router();

router
  .route('/')
  .post(authMiddleware, createPost)
  .get(authMiddleware, getAllPosts);
router
  .route('/uploadImages')
  .post(authMiddleware, imageMiddleware, uploadImages);

router.route('/postReacts').put(authMiddleware, reactToPost);
router.route('/getReacts/:id').get(authMiddleware, getReacts);
router.route('/comment').put(authMiddleware, comment);
router.route('/savePost/:id').put(authMiddleware, savePost);
router.route('/deletePost/:id').delete(authMiddleware, deletePost);

export default router;
