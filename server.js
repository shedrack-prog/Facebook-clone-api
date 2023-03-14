import express from 'express';
import { readdirSync } from 'fs';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// Routess---------------------------imports
import authRouter from './routes/authRoute.js';
import postRouter from './routes/postRoute.js';
import userRouter from './routes/userRoute.js';

// midllewares-----------------------
import notFoundMiddleware from './middlewares/not-found.js';
import errorHandlerMiddleware from './middlewares/error-handler.js';

// dv--------------------------------
import connectDB from './db/connect.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../frontend/build')));

// Routes ---------------------------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
});

// app.get('/', (req, res) => res.send('Welcome to home page of server'));
// middleware-------------------------------
app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);
// readdirSync('./routes').map((r) => app.use('/', require('./routes/' + r)));

const port = process.env.PORT || 8000;

const start = () => {
  connectDB(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server listening on port : ${port}`);
  });
};

start();
