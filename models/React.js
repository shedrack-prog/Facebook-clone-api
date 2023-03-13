import mongoose from 'mongoose';

const ReactSchema = new mongoose.Schema({
  react: {
    type: String,
    enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'],
    required: true,
  },
  postRef: {
    type: mongoose.Types.ObjectId,
    ref: 'Post',
  },

  reactBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model('React', ReactSchema);
