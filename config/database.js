const mongoose = require("mongoose");

require("dotenv").config();

const url = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.fhqi93b.mongodb.net/`;
// const url = `mongodb+srv://bhattjay114:HF5dci7NsO3jl73d@cluster0.uluao8q.mongodb.net/`;

const dbName = "Instagram";

const connect = mongoose.connect(url + dbName, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connect;
