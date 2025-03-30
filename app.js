// app.js 
  
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyparser = require("body-parser");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");



const app = express();
const cookieparser = require("cookie-parser");
require('dotenv').config();
require("./db");

app.use(cors());
app.use(express.json());
app.use(cookieparser());
app.use(express.static("Public"));
app.use("/api", fileRoutes);


app.use(bodyparser.json());

const port = process.env.PORT || 5000 ;

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
});

////////
const weatherRoutes = require("./routes/weatherRoutes");
app.use("/api", weatherRoutes);