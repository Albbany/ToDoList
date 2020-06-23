//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting to mongoose

 mongoose.connect("mongodb://localhost:27017/todolistDB",
  {useNewUrlParser: true, useUnifiedTopology: true});

  const itemsSchema = {
    name: String
  };

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Welcome to your todolist!",
  });
  const item2 = new Item({
    name: "<-- Hit this to delete an item.",
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item!",
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);

  app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
       Item.insertMany(defaultItems, function(err) {
    if(err) {
      console.log(err);      
    } else {
      console.log("Succesfully saved default items to DB!");
      
    }
  });

  res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err){
      if (!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems,
        });
      
        list.save();
        res.redirect("/" + customListName);
        //create a new list               
      } else {
        //show an existing list    
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
  res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});   

  app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err) {
        if(!err) {
          console.log("This Item was succesfully deleted!");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }
    
 

  });

  
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
//});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

//END!!!


//Old document
// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");

// //console.log(date());

// const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));

// app.get("/", function(req, res) {
  
//   const day = date.getDate();
 
//   res.render("list", {listTitle: day, newListItems: items});
// });

// app.post("/", function(req, res) {

//   const item =  req.body.newItem;

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   };

// });

// app.get("/work", function(req,res) {
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.post("/work", function(req,res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

// app.get("/about", function(req, res) {
//   res.render("about");
// });




// app.listen(process.env.PORT || 3000, function() { 
//   console.log("Server is running on port 3000");
// }); 