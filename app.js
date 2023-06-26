//requiring the modules we need
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/www/modules/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("www"));
//setting ejs 
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    console.log("GEIA SAS");    
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});