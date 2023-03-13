import express from 'express';
import { listImages } from '../controllers/uploadsController.js';
import {
  getProfile,
  updateCoverPicture,
  updateProfilePicture,
  updateUserDetails,
  addFriend,
  cancelFriendRequest,
  follow,
  unFollow,
  acceptRequest,
  unfriend,
  deleteRequest,
  searchUser,
  addToSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  getFriendsPageInfo,
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.route('/listImages').post(authMiddleware, listImages);
router.route('/listImages').post(authMiddleware, listImages);
router.route('/updateProfilePicture').put(authMiddleware, updateProfilePicture);
router.route('/updateCoverPicture').put(authMiddleware, updateCoverPicture);
router.route('/updateUserDetails').put(authMiddleware, updateUserDetails);
router.put('/addToSearchHistory', authMiddleware, addToSearchHistory);
router.get('/getSearchHistory', authMiddleware, getSearchHistory);
router.put('/removeFromSearch', authMiddleware, deleteSearchHistory);
router.get('/getFriendsPageInfos', authMiddleware, getFriendsPageInfo);
router.route('/getProfile/:username').get(authMiddleware, getProfile);
router.route('/addFriend/:id').put(authMiddleware, addFriend);
router
  .route('/cancelFriendRequest/:id')
  .put(authMiddleware, cancelFriendRequest);
router.route('/follow/:id').put(authMiddleware, follow);
router.route('/unfollow/:id').put(authMiddleware, unFollow);
router.route('/acceptRequest/:id').put(authMiddleware, acceptRequest);
router.route('/unfriend/:id').put(authMiddleware, unfriend);
router.route('/deleteRequest/:id').put(authMiddleware, deleteRequest);
router.route('/search/:searchTerm').post(authMiddleware, searchUser);

export default router;
