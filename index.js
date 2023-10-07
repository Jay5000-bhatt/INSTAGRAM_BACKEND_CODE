const express = require("express");
const app = express();

const PORT = 3001;

//   --------------DATABASE CONNECTION----------------
const connect = require("./config/database");
connect
  .then(() => {
    console.log("Successfully Connected to Database");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
//   --------------DATABASE CONNECTION----------------

// -------------------ROUTES-------------------------

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

app.use(express.json()); // for parsing application/json

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);

// -------------------ROUTES-------------------------

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
