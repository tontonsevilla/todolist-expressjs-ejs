// Modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/modules/date.js")
const mongoose = require('mongoose');
const _ = require("lodash");

// app Setups
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Main App Logic
const mongoUri = `mongodb+srv://admin-tonton:P%40ssw0rd@cluster0.bxoa6.mongodb.net/todoListDB`;
const mongooseOptions = {
  useNewUrlParser: true
};

const itemSchema = new mongoose.Schema({
  description: String
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

const welcomeItem = new Item({
  description: "-- Welcome to To-do List --"
});
const howToAddItem = new Item({
  description: "Click the plus (+) button tto add a new item."
});
const howToRemoveItem = new Item({
  description: "<-- Just check the box to remove an item."
});
const itemArray = [welcomeItem, howToAddItem, howToRemoveItem];

// Index Page
app.get("/", function(req, res) {

  home().catch(err => console.log(err));

  async function home() {
    await mongoose.connect(mongoUri, mongooseOptions);

    let todoList = [];
    let itemDocs = await Item.find({});

    if (itemDocs.length === 0) {
      itemDocs = await Item.insertMany(itemArray);

      todoList = itemDocs;
      mongoose.disconnect();

      res.redirect("/");
    } else {
      todoList = itemDocs;
      mongoose.disconnect();
    }

    res.render("index", {
      todoList: todoList,
      categoryToDoList: "Today"
    });
  }

});

app.post("/", function(req, res) {

  createItem().catch(err => console.log(err));

  async function createItem() {
    await mongoose.connect(mongoUri, mongooseOptions);

    let listName = _.startCase(req.body.listName);

    let item = new Item({
      description: req.body.newItem
    });

    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      let listDoc = await List.findOne({name: listName});

      listDoc.items.push(item);
      await listDoc.save();

      res.redirect(`/${_.kebabCase(listName)}`);
    }
  }

});

app.post("/delete", function(req, res) {

  deleteItem().catch(err => console.log(err));

  async function deleteItem() {

    const itemId = req.body.item;
    const listName = _.startCase(req.body.listName);

    await mongoose.connect(mongoUri, mongooseOptions);

    if (listName === "Today") {
      await Item.findByIdAndRemove(itemId);

      res.redirect("/");
    } else {
      await List.findOneAndUpdate({name: listName},{$pull: {items: {_id: itemId}}});

      res.redirect(`/${_.kebabCase(listName)}`);
    }

  }

});

// Category To-Do List Page
app.get("/:categoryName",  function (req, res) {

  category().catch(err => console.log(err));

  async function category() {

    let todoList = [];
    let categoryName = _.startCase(req.params.categoryName);

    await mongoose.connect(mongoUri, mongooseOptions);

    let listDoc = await List.findOne({name: categoryName});

    if (listDoc) {
        todoList = listDoc.items;

        await mongoose.disconnect();

        res.render("index", {
          todoList: todoList,
          categoryToDoList: categoryName
        });
    } else {
      listDoc = new List({
        name: categoryName,
        items: itemArray
      });

      await listDoc.save();

      await mongoose.disconnect();

      res.redirect(`/${_.kebabCase(categoryName)}`);
    }

  }

});

// About Page
app.get("/about", function(req, res) {

  res.render("about");

});

const port = 3000;
app.listen(port, console.log(`Server is now listening to port ${port}`));
