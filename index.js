const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const historyRoutes = require("./routes/historyRoutes");
const path = require("path");

dotenv.config();
mongoose.set('strictQuery', true);
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.use('/static', express.static('public'))

app.use("/api/history", historyRoutes);

// mongoose connection
mongoose.connect("mongodb+srv://sven-pancake:O11Km6NudwjWjtwv@cluster0.12dbt7h.mongodb.net/USDC?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connection Successful!")
}).catch((err) => console.log(err))

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});

