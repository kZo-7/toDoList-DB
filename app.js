//requiring the modules we need
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/www/modules/date.js");
const path = require("path");

//setting up the express app
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("www"));
//setting up ejs
app.set("views", path.join(__dirname + "/www/views"));
app.set("view engine", "ejs");

const tasks = ["Say good morning to yourself 🎈"];
const workTasks = [];

app.get("/", (req, res) => {
    let currentDate = date.getDate();

    res.render("toDoList", {
        listTitle: currentDate,
        newListTasks: tasks
    });
});

app.post("/", (req, res) => {
    //newTask is the name of the input element of toDoList.ejs file
    let task = req.body.newTask;
    let listType = req.body.list;

    if (listType === "Work List") {
        workTasks.push(task);
        res.redirect("/work");
    } else {
        tasks.push(task);
        res.redirect("/");
    }
});

app.get("/work", (req, res) => {
    res.render("toDoList", {
        listTitle: "Work List",
        newListTasks: workTasks
    });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});