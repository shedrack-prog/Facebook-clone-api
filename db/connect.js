import mongoose from "mongoose";

const connectDB = (url) => {
  return mongoose.connect(url);
  // mongoose.set("strictQuery", true);
};
export default connectDB;
