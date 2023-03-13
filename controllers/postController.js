import Post from '../models/Post.js';
import User from '../models/User.js';

const createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate('user', 'username first_name last_name cover picture ');
    res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const tempFollowing = await User.findById(req.user.id).select('following');
    const following = tempFollowing.following;

    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate('user', 'first_name last_name username picture cover')
        .populate(
          'comments.commentBy',
          'first_name last_name username picture cover'
        )
        .sort({ createdAt: -1 })
        .limit(10);
    });

    const followingPosts = (await Promise.all(promises)).flat();
    const userPosts = await Post.find({ user: req.user.id })
      .populate('user', 'first_name last_name username picture cover')
      .populate(
        'comments.commentBy',
        'first_name last_name username picture cover'
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

    followingPosts.push(...[...userPosts]);

    followingPosts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    res.status(200).json(followingPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const comment = async (req, res) => {
  const { comment, postId, image } = req.body;

  try {
    const newComment = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    ).populate('comments.commentBy', 'first_name last_name picture username');

    res.status(200).json(newComment.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const savePost = async (req, res) => {
  const postId = req.params.id;
  const user = req.user.id;
  try {
    const dbUser = await User.findById(user);

    const check = dbUser?.savedPosts.find(
      (post) => post.post.toString() == postId
    );
    if (check) {
      await User.findByIdAndUpdate(user, {
        $pull: {
          savedPosts: {
            post: postId,
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(user, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
    res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res
      .status(200)
      .json({ status: 'ok', message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { createPost, getAllPosts, comment, savePost, deletePost };
