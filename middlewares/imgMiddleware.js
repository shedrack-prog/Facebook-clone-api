import fs from 'fs';

const imageMiddleware = (req, res, next) => {
  try {
    if (!req.files || Object.values(req.files).flat().length === 0) {
      return res.status(400).json({ message: 'No file selected' });
    }
    let files = Object.values(req.files).flat();

    files.forEach((file) => {
      if (
        file.mimetype !== 'image/jpeg' &&
        file.mimetype !== 'image/png' &&
        file.mimetype !== 'image/gif' &&
        file.mimetype !== 'image/jpg' &&
        file.mimetype !== 'image/webp'
      ) {
        removeTmp(file.tempFilePath);
        return res
          .status(400)
          .json({ message: 'image format is not supported' });
      }
      if (file.size > 1024 * 1024 * 5) {
        removeTmp(file.tempFilePath);
        return res
          .status(400)
          .json({ message: 'File size is too large. max 5mb' });
      }
    });
    next();
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

export default imageMiddleware;
