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
const data = JSON.parse(fs.readFileSync("./data/factories.json", "utf-8"));

// Helper functions
const saveData = (data) => {
  fs.writeFileSync("./data/factories.json", JSON.stringify(data, null, 2));
};

// User routes
const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

app.post("/register", (req, res) => {
  const { username, password, firstName, lastName, gender, birthDate } = req.body;
  if (users.find(user => user.username === username)) {
    return res.status(400).send('Username already exists');
  }
  const newUser = { username, password, firstName, lastName, gender, birthDate, role: 'Kupac', deleted: false };
  users.push(newUser);
  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
  res.status(201).send(newUser);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password && !user.deleted);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }
  res.send(user);
});

app.put("/users/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username && !u.deleted);
  if (!user) {
    return res.status(404).send('User not found');
  }
  const { password, firstName, lastName, gender, birthDate } = req.body;
  if (password) user.password = password;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (gender) user.gender = gender;
  if (birthDate) user.birthDate = birthDate;

  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
  res.send('User updated');
});

app.delete("/users/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) {
    return res.status(404).send('User not found');
  }
  user.deleted = true;
  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
  res.send('User deleted');
});

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
    comments: [],
    chocolates: [],
    purchases: [],
    deleted: false,
  };
  data.push(newFactory);
  saveData(data);
  res.status(201).send(newFactory);
});

app.get("/factories", (req, res) => {
  const activeFactories = data.filter((f) => !f.deleted);
  res.send(activeFactories);
});

app.get("/factories/:name", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  res.send(factory);
});

app.put("/factories/:name", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { location, workingHours, status, logo, managerUsername, rating } = req.body;
  if (location) factory.location = location;
  if (workingHours) factory.workingHours = workingHours;
  if (status) factory.status = status;
  if (logo) factory.logo = logo;
  if (managerUsername) factory.managerUsername = managerUsername;
  if (rating) factory.rating = rating;

  saveData(data);
  res.send("Factory updated");
});

app.delete("/factories/:name", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  factory.deleted = true;
  saveData(data);
  res.send("Factory deleted");
});

// Chocolates routes
app.post("/factories/:name/chocolates", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { name, price, type, kind, weight, description, image, status, quantity } = req.body;
  const newChocolate = {
    name,
    price,
    type,
    kind,
    weight,
    description,
    image,
    status,
    quantity,
    deleted: false,
  };
  factory.chocolates.push(newChocolate);
  saveData(data);
  res.status(201).send(newChocolate);
});

app.get("/factories/:name/chocolates", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activeChocolates = factory.chocolates.filter((c) => !c.deleted);
  res.send(activeChocolates);
});

app.get("/factories/:name/chocolates/:chocolateName", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.name === req.params.chocolateName && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  res.send(chocolate);
});

app.put("/factories/:name/chocolates/:chocolateName", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.name === req.params.chocolateName && !c.deleted);
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

  saveData(data);
  res.send("Chocolate updated");
});

app.delete("/factories/:name/chocolates/:chocolateName", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.name === req.params.chocolateName);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  chocolate.deleted = true;
  saveData(data);
  res.send("Chocolate deleted");
});

// Purchases routes
app.post("/factories/:name/purchases", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { id, chocolates, date, totalPrice, username, status } = req.body;
  const newPurchase = {
    id,
    chocolates,
    date,
    totalPrice,
    username,
    status,
    deleted: false,
  };
  factory.purchases.push(newPurchase);
  saveData(data);
  res.status(201).send(newPurchase);
});

app.get("/factories/:name/purchases", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activePurchases = factory.purchases.filter((p) => !p.deleted);
  res.send(activePurchases);
});

app.get("/factories/:name/purchases/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.id) && !p.deleted);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  res.send(purchase);
});

app.put("/factories/:name/purchases/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.id) && !p.deleted);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  const { chocolates, date, totalPrice, username, status } = req.body;
  if (chocolates) purchase.chocolates = chocolates;
  if (date) purchase.date = date;
  if (totalPrice) purchase.totalPrice = totalPrice;
  if (username) purchase.username = username;
  if (status) purchase.status = status;

  saveData(data);
  res.send("Purchase updated");
});

app.delete("/factories/:name/purchases/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.id));
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  purchase.deleted = true;
  saveData(data);
  res.send("Purchase deleted");
});

// Comments routes
app.post("/factories/:name/comments", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { username, text, rating } = req.body;
  const newComment = {
    username,
    text,
    rating,
    deleted: false,
  };
  factory.comments.push(newComment);
  saveData(data);
  res.status(201).send(newComment);
});

app.get("/factories/:name/comments", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activeComments = factory.comments.filter((c) => !c.deleted);
  res.send(activeComments);
});

app.get("/factories/:name/comments/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.id) && !c.deleted);
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  res.send(comment);
});

app.put("/factories/:name/comments/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.id) && !c.deleted);
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  const { text, rating } = req.body;
  if (text) comment.text = text;
  if (rating) comment.rating = rating;

  saveData(data);
  res.send("Comment updated");
});

app.delete("/factories/:name/comments/:id", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.id));
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  comment.deleted = true;
  saveData(data);
  res.send("Comment deleted");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
