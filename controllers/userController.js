import User from '../models/User.js';
import Post from '../models/Post.js';
import mongoose from 'mongoose';
const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ username }).select('-password');

    if (!profile) {
      return res.status(400).json({ ok: false, message: 'No user found' });
    }
    if (!profile) {
      return res.json({ ok: false });
    }
    const friendship = {
      friends: false,
      following: false,
      requestSent: false,
      requestReceived: false,
    };

    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendship.friends = true;
    }
    if (user.following.includes(profile._id)) {
      friendship.following = true;
    }
    if (user.requests.includes(profile._id)) {
      friendship.requestReceived = true;
    }
    if (profile.requests.includes(user._id)) {
      friendship.requestSent = true;
    }
    const posts = await Post.find({ user: profile._id })
      .populate('user')
      .populate('comments.commentBy', 'first_name last_name username, picture ')
      .sort({ createdAt: -1 });
    await profile.populate('friends', 'first_name last_name username picture');

    res.status(200).json({ ...profile.toObject(), posts, friendship });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.status(200).json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCoverPicture = async (req, res) => {
  try {
    const { url } = req.body;
    // if (!url) {
    //   return res.status(400).json({ message: 'Please choose a file' });
    // }

    await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.status(200).json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { infos } = req.body;
  try {
    const updatedDetails = await User.findByIdAndUpdate(
      req.user.id,
      {
        details: infos,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: { requests: sender._id },
        });
        await receiver.updateOne({
          $push: { followers: sender._id },
        });
        await sender.updateOne({
          $push: { following: receiver._id },
        });
        res.json({ message: 'friend request has been sent' });
      } else {
        return res.status(400).json({ message: 'Already sent' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        await receiver.updateOne({
          $pull: {
            followers: sender._id,
          },
        });

        await sender.updateOne({
          $pull: {
            following: receiver._id,
          },
        });
        res
          .status(200)
          .json({ message: 'friend request cancelled successfully' });
      } else {
        return res
          .status(400)
          .json({ message: 'friend request cancelled already' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "you can't cancelled friend request to your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (
        !sender.following.includes(receiver._id) &&
        !receiver.followers.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: {
            followers: sender._id,
          },
        });

        await sender.updateOne({
          $push: {
            following: receiver._id,
          },
        });
        res.status(200).json({ message: 'follows successfully' });
      } else {
        return res.status(400).json({ message: 'Already following ' });
      }
    } else {
      return res.status(400).json({ message: "you can't follow your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const unFollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (
        receiver.followers.includes(sender._id) &&
        sender.following.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $pull: {
            followers: sender._id,
          },
        });

        await sender.updateOne({
          $pull: {
            following: receiver._id,
          },
        });
        res.status(200).json({ message: 'Unfollows successfully' });
      } else {
        return res.status(400).json({ message: 'Already unfollowed ' });
      }
    } else {
      return res.status(400).json({ message: "you can't unfollow your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const acceptRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);

      if (receiver.requests.includes(sender._id)) {
        await receiver.update({
          $push: {
            friends: sender._id,
            following: sender._id,
          },
        });

        await sender.update({
          $push: {
            friends: receiver._id,
            followers: receiver._id,
          },
        });
        await receiver.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        res
          .status(200)
          .json({ message: 'Friend request accepted successfully' });
      } else {
        return res.status(400).json({ message: 'Already friends ' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "you can't accept request from your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const unfriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (
        sender.friends.includes(receiver._id) &&
        receiver.friends.includes(sender._id)
      ) {
        await sender.update({
          $pull: {
            friends: receiver._id,
            following: receiver._id,
            followers: receiver._id,
          },
        });
        await receiver.update({
          $pull: {
            friends: sender._id,
            following: sender._id,
            followers: sender._id,
          },
        });

        res
          .status(200)
          .json({ message: 'you unfriend this user successfully' });
      } else {
        return res.status(400).json({ message: 'You are not friends before ' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "you can't accept request from your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (sender.requests.includes(receiver._id)) {
        await sender.update({
          $pull: {
            requests: receiver._id,
            followers: receiver._id,
          },
        });
        await receiver.update({
          $pull: {
            following: sender._id,
          },
        });

        res.status(200).json({ message: 'request deleted successfully' });
      } else {
        return res.status(400).json({ message: 'no request from this user ' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "you can't cancel request from your self" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const results = await User.find({
      $text: { $search: searchTerm },
    }).select('first_name last_name picture username');
    res.json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addToSearchHistory = async (req, res) => {
  try {
    const { searchUser } = req.body;
    const search = {
      user: searchUser,
      createdAt: new Date(),
    };
    const user = await User.findById(req.user.id);
    const check = user.search.find((x) => x.user.toString() === searchUser);

    if (check) {
      await User.updateOne(
        {
          _id: req.user.id,
          'search._id': check._id,
        },
        {
          $set: { 'search.$.createdAt': new Date() },
        }
      );
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          search: search,
        },
      });
    }
    res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const results = await User.findById(req.user.id)
      .select('search')
      .populate('search.user', 'first_name last_name username picture');
    res.status(200).json(results.search);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSearchHistory = async (req, res) => {
  try {
    const { searchUser } = req.body;
    await User.updateOne(
      {
        _id: req.user.id,
      },
      { $pull: { search: { user: searchUser } } }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getFriendsPageInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('friends requests')
      .populate('friends', 'first_name last_name picture username')
      .populate('requests', 'first_name last_name picture username');

    const sentRequests = await User.find({
      requests: mongoose.Types.ObjectId(req.user.id),
    });
    res.status(200).json({
      friends: user.friends,
      requests: user.requests,
      sentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProfile,
  updateProfilePicture,
  updateCoverPicture,
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
};
