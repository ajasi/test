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
const chocolates = JSON.parse(fs.readFileSync("./data/chocolates.json", "utf-8"));

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

// Chocolates routes
app.post("/chocolates", (req, res) => {
  const { name, price, type, factoryName, kind, weight, description, image, status, quantity } = req.body;
  const newChocolate = {
    name,
    price,
    type,
    factoryName,
    kind,
    weight,
    description,
    image,
    status,
    quantity,
    deleted: false,
  };
  chocolates.push(newChocolate);
  fs.writeFileSync("./data/chocolates.json", JSON.stringify(chocolates, null, 2));
  res.status(201).send(newChocolate);
});

app.get("/chocolates", (req, res) => {
  const activeChocolates = chocolates.filter((c) => !c.deleted);
  res.send(activeChocolates);
});

app.get("/chocolates/:name", (req, res) => {
  const chocolate = chocolates.find((c) => c.name === req.params.name && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  res.send(chocolate);
});

// New route: Get all chocolates in a specific factory
app.get("/factories/:name/chocolates", (req, res) => {
  const factory = factories.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const factoryChocolates = chocolates.filter((c) => c.factoryName === req.params.name && !c.deleted);
  res.send(factoryChocolates);
});

app.put("/chocolates/:name", (req, res) => {
  const chocolate = chocolates.find((c) => c.name === req.params.name && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  const { price, type, kind, weight, description, image, status, quantity } = req.body;
  if (price) chocolate.price = price;
  if (type) chocolate.type = type;
  if (kind) chocolate.kind = kind;
  if (weight) chocolate.weight = weight;
  if (description) chocolate.description = description;
  if (image) chocolate.image = image;
  if (status) chocolate.status = status;
  if (quantity) chocolate.quantity = quantity;

  fs.writeFileSync("./data/chocolates.json", JSON.stringify(chocolates, null, 2));
  res.send("Chocolate updated");
});

// Logical delete for chocolates
app.delete("/chocolates/:name", (req, res) => {
  const chocolate = chocolates.find((c) => c.name === req.params.name);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  chocolate.deleted = true;
  fs.writeFileSync("./data/chocolates.json", JSON.stringify(chocolates, null, 2));
  res.send("Chocolate deleted");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
