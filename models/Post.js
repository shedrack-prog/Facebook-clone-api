import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;

const PostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['profilePicture', 'coverPicture', null],
      default: null,
    },
    text: {
      type: String,
    },
    images: {
      type: Array,
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    background: {
      type: String,
    },
    comments: [
      {
        comment: {
          type: String,
        },
        image: {
          type: String,
        },
        commentBy: {
          type: ObjectId,
          ref: 'User',
        },
        commentAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', PostSchema);
