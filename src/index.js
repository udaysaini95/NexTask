import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import app from './app.js';
import connectDB from './db/index.js';


const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
          console.log(`Example app listening on port http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err);
        process.exit(1);
    })





