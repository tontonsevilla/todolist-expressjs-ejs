// Modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/modules/date.js")

// app Setups
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Main App Logic

// Index Page
const todoList = ["Item One", "Item Two"];

app.get("/", function(req, res) {

  res.render("index", {
    today: date.getDate(),
    todoList: todoList
  });

});

app.post("/", function(req, res) {

  todoList.push(req.body.newItem);

  res.render("index", {
    today: date.getDate(),
    todoList: todoList
  });

});

// About Page
app.get("/about", function(req, res) {

  res.render("about");

});

const port = 3000;
app.listen(port, console.log(`Server is now listening to port ${port}`));
