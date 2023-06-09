import mongoose from 'mongoose';
import React from '../models/React.js';
import User from '../models/User.js';

const reactToPost = async (req, res) => {
  try {
    const { postId, react } = req.body;
    const check = await React.findOne({
      postRef: postId,
      reactBy: mongoose.Types.ObjectId(req.user.id),
    });
    if (check == null) {
      const newReact = new React({
        react: react,
        postRef: postId,
        reactBy: req.user.id,
      });
      await newReact.save();
    } else {
      if (check.react == react) {
        await React.findByIdAndRemove(check._id);
      } else {
        await React.findByIdAndUpdate(check._id, {
          react: react,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReacts = async (req, res) => {
  const postId = req.params.id;
  try {
    const reactsArray = await React.find({
      postRef: postId,
    });

    const newReacts = reactsArray.reduce((group, react) => {
      let key = react['react'];
      group[key] = group[key] || [];
      group[key].push(react);
      return group;
    }, {});

    const reacts = [
      {
        react: 'like',
        count: newReacts.like ? newReacts.like.length : 0,
      },
      {
        react: 'love',
        count: newReacts.love ? newReacts.love.length : 0,
      },
      {
        react: 'haha',
        count: newReacts.haha ? newReacts.haha.length : 0,
      },
      {
        react: 'wow',
        count: newReacts.wow ? newReacts.wow.length : 0,
      },
      {
        react: 'sad',
        count: newReacts.sad ? newReacts.sad.length : 0,
      },
      {
        react: 'angry',
        count: newReacts.angry ? newReacts.angry.length : 0,
      },
    ];
    reacts.sort((a, b) => {
      return b.count - a.count;
    });

    const check = await React.findOne({
      postRef: postId,
      reactBy: mongoose.Types.ObjectId(req.user.id),
    });
    const user = await User.findById(req.user.id);

    const checkSaved = user?.savedPosts.find(
      (x) => x.post.toString() == postId
    );
    res.status(200).json({
      reacts,
      check: check?.react,
      total: reactsArray.length,
      checkSaved: checkSaved ? true : false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { reactToPost, getReacts };
