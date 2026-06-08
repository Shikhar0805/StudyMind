require('dotenv').config();
const express = require('express');
const cors = require('cors');
const studyRoutes = require('./routes/study.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/study', studyRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
