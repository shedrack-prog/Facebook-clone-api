import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;
const UserSchema = new mongoose.Schema(
  {
    first_name: {
      required: [true, 'First Name is required'],
      type: String,
      trim: true,
      text: true,
    },
    last_name: {
      required: [true, 'Last Name is required'],
      type: String,
      trim: true,
      text: true,
    },
    username: {
      required: [true, 'Username is required'],
      type: String,
      trim: true,
      text: true,
      unique: true,
    },
    email: {
      required: [true, 'Email is required'],
      type: String,
      trim: true,
    },
    password: {
      required: [true, 'Password is required'],
      type: String,
    },
    picture: {
      type: String,
      default:
        'https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png',
    },
    cover: {
      type: String,
      default: '',
    },
    gender: {
      required: [true, 'gender is required'],
      type: String,
      trim: true,
    },
    bYear: {
      type: Number,
      required: true,
      trim: true,
    },
    bMonth: {
      type: Number,
      required: true,
      trim: true,
    },
    bDay: {
      type: Number,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    requests: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    search: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
      },
    ],
    details: {
      bio: {
        type: String,
      },
      otherName: {
        type: String,
      },
      job: {
        type: String,
      },
      workplace: {
        type: String,
      },
      highSchool: {
        type: String,
      },
      currentCity: {
        type: String,
      },
      hometown: {
        type: String,
      },
      relationship: {
        type: String,
        enum: ['Single', 'In a relationship', 'Married', 'Divorced'],
      },
      instagram: {
        type: String,
      },
    },
    savedPosts: [
      {
        post: {
          type: mongoose.Schema.ObjectId,
          ref: 'Post',
        },
        savedAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', UserSchema);
