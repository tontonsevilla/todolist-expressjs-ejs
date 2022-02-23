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
const mongoUri = 'mongodb://localhost:27017/todoListDB';
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

// Index Page
app.get("/", function(req, res) {
  let todoList = [];

  mongoose.connect(mongoUri, mongooseOptions, function(err) {
    if (err) {
      console.log(err);
    } else {
      Item.find({}, function(err, items){
        if (err) {
          console.log(err);
        } else {
          todoList = items;
        }

        res.render("index", {
          todoList: todoList,
          categoryToDoList: "Today"
        });

        mongoose.disconnect();
      });
    }
  });
});

app.post("/", function(req, res) {
  mongoose.connect(mongoUri, mongooseOptions, function(err) {
    if (err) {
      console.log(err);
    } else {
      let listName = _.startCase(req.body.listName);

      const item = new Item({
        description: req.body.newItem
      });

      if (listName === "Today") {
        item.save();
        res.redirect("/");
      } else {
        List.findOne({name: listName}, function(findOneErr, docList) {
          if (findOneErr) {
            console.log(findOneErr);
          } else {
            docList.items.push(item);
            docList.save();
            res.redirect(`/${_.kebabCase(listName)}`);
          }
        });
      }
    }
  });
});

app.post("/delete", function(req, res) {
  const itemId = req.body.item;
  const listName = _.startCase(req.body.listName);

  mongoose.connect(mongoUri, mongooseOptions, function(err) {
    if (err) {
      console.log(err);
    } else {
      if (listName === "Today") {
        Item.findByIdAndRemove(itemId, function(errFindByIdAndRemove, docItem) {
          if (errFindByIdAndRemove) {
            console.log(errFindByIdAndRemove);
          }
        });

        res.redirect("/");
      } else {
        List.findOneAndUpdate({name: listName},
          {$pull: {items: {_id: itemId}}},
          function(errFindOne, docList) {
            if (errFindOne) {
              console.log(errFindOne);
            } else {
              res.redirect(`/${_.kebabCase(listName)}`);
            }
        });
      }
    }
  });

});

// Category To-Do List Page
app.get("/:categoryName",  function (req, res) {
  let todoList = [];
  let categoryName = _.startCase(req.params.categoryName);

  mongoose.connect(mongoUri, mongooseOptions, function(connErr) {
    if (connErr) {
      console.log(connErr);
    } else {
      List.findOne({name: categoryName}, function(findErr, docList){
        if (findErr) {
          console.log(findErr);
        } else {

          if (docList) {
              todoList = docList.items;
              mongoose.disconnect();
          } else {
            let list = new List({
              name: categoryName,
              items: todoList
            });

            list.save(function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log(`A category "${categoryName}" was Successfully added.`);
              }

              mongoose.disconnect();
            });
          }

          res.render("index", {
            todoList: todoList,
            categoryToDoList: categoryName
          });
        }

      });
    }
  });
});

// About Page
app.get("/about", function(req, res) {

  res.render("about");

});

const port = 3000;
app.listen(port, console.log(`Server is now listening to port ${port}`));
