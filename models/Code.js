import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;
const CodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  user: {
    required: true,
    type: ObjectId,
    ref: 'User',
  },
});
export default mongoose.model('Code', CodeSchema);
