
import express from './node_modules/express';
const app = express();

app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Online Voting System")
})

app.listen(5000, () => {
    console.log("Server is up and Running")
})