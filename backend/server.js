const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routes/route");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   next();
// });

app.use("/api", router);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
