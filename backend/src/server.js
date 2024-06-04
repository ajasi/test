import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Chocolate Factory API");
});

// Load data
const factories = JSON.parse(fs.readFileSync("./data/factories.json", "utf-8"));

// Factories routes
app.post("/factories", (req, res) => {
  const { name, location, workingHours, status, logo, managerUsername } = req.body;
  const newFactory = {
    name,
    location,
    workingHours,
    status,
    logo,
    managerUsername,
    rating: 0,
    chocolates: [],
    deleted: false,
  };
  factories.push(newFactory);
  fs.writeFileSync("./data/factories.json", JSON.stringify(factories, null, 2));
  res.status(201).send(newFactory);
});

app.get("/factories", (req, res) => {
  const activeFactories = factories.filter((f) => !f.deleted);
  res.send(activeFactories);
});

app.get("/factories/:name", (req, res) => {
  const factory = factories.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  res.send(factory);
});

// Logical delete for factories
app.delete("/factories/:name", (req, res) => {
  const factory = factories.find((f) => f.name === req.params.name);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  factory.deleted = true;
  fs.writeFileSync("./data/factories.json", JSON.stringify(factories, null, 2));
  res.send("Factory deleted");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
