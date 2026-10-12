const dotenv = require('dotenv');

dotenv.config();

const { checkConfig } = require('./middleware/security');
const connectDB = require('./config/db');

checkConfig(); // stop early if secrets are missing

const app = require('./app');
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    require('./services/itemSorter').warmUp(); // load the ML model in the background
  });
});
