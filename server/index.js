const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));

app.use(express.json());
app.use(cookieParser());
app.use(require("./routes/routes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), async () => {
    console.log(`Servidor en el puerto ${app.get("port")}`);
});