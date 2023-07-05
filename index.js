//requiring the modules we need
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");

//we have to hide API keys or passwords to a hidden file to be safe
require("dotenv").config(
    {
        path:__dirname + '/.env'
    }
);

//setting up the express app
const app = express();

const port = process.env.PORT || process.env.DEV_PORT;
const mongoURI = process.env.MONGO_URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("www"));

//setting up ejs
app.set("views", path.join(__dirname + "/www/views"));
app.set("view engine", "ejs");

//MongoDB -> Connections, Schemas, Models & Documents
//create a new database into mongoDB
mongoose.connect(`${mongoURI}`);

//SCHEMAS
const tasksSchema = new mongoose.Schema({
    name: String
});
const listSchema = new mongoose.Schema({
    name: String,
    tasks: [tasksSchema]//an array of tasksSchema based tasks
});

//MODELS
const Task = mongoose.model("Task", tasksSchema);
const List = mongoose.model("List", listSchema);

//DOCUMENTS
const task1 = new Task({
    name: "Hit the + button to add a new task"
});
const task2 = new Task({
    name: "<-- Hit this to check a completed task"
});
const task3 = new Task({
    name: "Give yourself a big smile🎈"
});
const defaultTasks = [task1, task2, task3];

//GET methods
app.get("/", (req, res) => {
    Task.find()
        .then(foundTasks => {
            if (foundTasks.length === 0) {
                Task.insertMany(defaultTasks)
                    .then(() => {
                        console.log("Default Tasks saved to todolistDB");
                    })
                    .catch((err) => {
                        console.log(`Default tasks failed to be saved into todolistDB. Error is: ${err}`);
                    });
                res.redirect("/");
            } else {
                List.find()
                    .then(allLists => {
                        res.render("toDoList", {
                            listTitle: "Daily Tasks",
                            newListTasks: foundTasks,
                            savedLists: allLists
                        });
                    })
                    .catch(err => { console.log("NOT savedLISTS. Error is: " + err) });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName })
        .then(foundList => {
            if (!foundList) { //if list does not exist, we create it
                const list = new List({
                    name: customListName,
                    tasks: defaultTasks
                });
                list.save();
                res.redirect("/" + customListName);
            } else { //if it exists, then render it
                //find all list documents and render them to let user knowing the active lists
                List.find()
                    .then(allLists => {
                        res.render("toDoList", {
                            listTitle: foundList.name,
                            newListTasks: foundList.tasks,
                            savedLists: allLists
                        });
                    })
                    .catch(err => { console.log("NOT savedLISTS. Error is: " + err) });
            }
        })
        .catch(err => {
            console.log(`Failed to matching processing at GET method. Error is: ${err}`);
        });
});

//POST methods
app.post("/", (req, res) => {
    //"newTask" and "list" are the names of the input elements of toDoList.ejs file
    const taskName = req.body.newTask;
    const listName = req.body.list;

    const task = new Task({
        name: taskName
    });

    if (listName === "Daily Tasks") {
        task.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then(foundList => {
                foundList.tasks.push(task);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch(err => {
                console.log(`Something bad occured. Error is: ${err}`);
            });
    }
});

app.post("/delete", (req, res) => {
    const checkedTaskID = req.body.checkbox;
    const listName = req.body.listName;

    //Deleting the checked task from default list    
    if (listName === "Daily Tasks") {
        Task.findByIdAndDelete(checkedTaskID)
            .then(() => {
                console.log(`Succesfully deleted the task with id= "${checkedTaskID}".`);
                res.redirect("/");
            })
            .catch(err => {
                console.log(`Could not deleted the checked task from DB. Error is: ${err}`);
                res.redirect("/");
            });
    } else { //Deleting the checked task from custom list
        List.findOneAndUpdate({ name: listName }, {$pull: {tasks: {_id: checkedTaskID}}})
            .then(() => {
                console.log(`Succesfully deleted the task with id= "${checkedTaskID}" from list "${listName}".`);
                res.redirect("/" + listName);
            })
            .catch(err => {
                console.log(`Something bad occured while updating the custom list. No deleted docs. Error is: ${err}`);
            });
    }
});

app.listen(port, () => {
    console.log("Server started on port " + port);
});