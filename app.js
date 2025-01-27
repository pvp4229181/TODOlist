const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { ObjectId } = require('mongodb');
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

mongoose.connect("mongodb://127.0.0.1:27017/data").then(() => {
  console.log("Connected to MongoDB!");
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("task", itemSchema);

app.get("/", async (req, res) => {
  try {
    const items = await Item.find({});
    res.render("list", { items }); 
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Error fetching data.");
  }
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;

  try {
    const newItem = new Item({ name: itemName });
    await newItem.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error saving item:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).send(err.message)
    }
    res.status(500).send("Error saving data.");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const checkedItemId = req.body.checkbox1;
    if (!ObjectId.isValid(checkedItemId)) {
      console.error("Invalid ObjectId:", checkedItemId);
      return res.status(400).send("Invalid item ID.");
    }

    const result = await Item.findByIdAndDelete(checkedItemId);
    if (!result) {
        console.error("Item not found:", checkedItemId)
        return res.status(404).send("Item not found")
    }
    console.log("Deleted item with ID:", checkedItemId);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Error deleting the item.");
  }
});

app.listen("4000",function(){
  console.log("server started");
});