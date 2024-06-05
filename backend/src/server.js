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
const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
const customerTypes = JSON.parse(fs.readFileSync("./data/customerTypes.json", "utf-8"));
const locations = JSON.parse(fs.readFileSync("./data/locations.json", "utf-8"));
const factories = JSON.parse(fs.readFileSync("./data/factories.json", "utf-8"));
const chocolates = JSON.parse(fs.readFileSync("./data/chocolates.json", "utf-8"));
const carts = JSON.parse(fs.readFileSync("./data/carts.json", "utf-8"));
const purchases = JSON.parse(fs.readFileSync("./data/purchases.json", "utf-8"));
const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));

// User routes
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

// Customer Type routes
app.post("/customerTypes", (req, res) => {
  const { type, discount, targetPoints } = req.body;
  const newCustomerType = { type, discount, targetPoints, deleted: false };
  customerTypes.push(newCustomerType);
  fs.writeFileSync('./data/customerTypes.json', JSON.stringify(customerTypes, null, 2));
  res.status(201).send(newCustomerType);
});

app.get("/customerTypes", (req, res) => {
  const activeCustomerTypes = customerTypes.filter((ct) => !ct.deleted);
  res.send(activeCustomerTypes);
});

app.put("/customerTypes/:type", (req, res) => {
  const customerType = customerTypes.find(ct => ct.type === req.params.type && !ct.deleted);
  if (!customerType) {
    return res.status(404).send('Customer Type not found');
  }
  const { discount, targetPoints } = req.body;
  if (discount) customerType.discount = discount;
  if (targetPoints) customerType.targetPoints = targetPoints;

  fs.writeFileSync('./data/customerTypes.json', JSON.stringify(customerTypes, null, 2));
  res.send('Customer Type updated');
});

app.delete("/customerTypes/:type", (req, res) => {
  const customerType = customerTypes.find(ct => ct.type === req.params.type);
  if (!customerType) {
    return res.status(404).send('Customer Type not found');
  }
  customerType.deleted = true;
  fs.writeFileSync('./data/customerTypes.json', JSON.stringify(customerTypes, null, 2));
  res.send('Customer Type deleted');
});

// Location routes
app.post("/locations", (req, res) => {
  const { id, longitude, latitude, address } = req.body;
  const newLocation = { id, longitude, latitude, address, deleted: false };
  locations.push(newLocation);
  fs.writeFileSync('./data/locations.json', JSON.stringify(locations, null, 2));
  res.status(201).send(newLocation);
});

app.get("/locations", (req, res) => {
  const activeLocations = locations.filter((loc) => !loc.deleted);
  res.send(activeLocations);
});

app.put("/locations/:id", (req, res) => {
  const location = locations.find(loc => loc.id === parseInt(req.params.id) && !loc.deleted);
  if (!location) {
    return res.status(404).send('Location not found');
  }
  const { longitude, latitude, address } = req.body;
  if (longitude) location.longitude = longitude;
  if (latitude) location.latitude = latitude;
  if (address) location.address = address;

  fs.writeFileSync('./data/locations.json', JSON.stringify(locations, null, 2));
  res.send('Location updated');
});

app.delete("/locations/:id", (req, res) => {
  const location = locations.find(loc => loc.id === parseInt(req.params.id));
  if (!location) {
    return res.status(404).send('Location not found');
  }
  location.deleted = true;
  fs.writeFileSync('./data/locations.json', JSON.stringify(locations, null, 2));
  res.send('Location deleted');
});

// Factories routes
app.post("/factories", (req, res) => {
  const { name, locationId, workingHours, status, logo, managerUsername } = req.body;
  const newFactory = {
    name,
    locationId,
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

app.delete("/chocolates/:name", (req, res) => {
  const chocolate = chocolates.find((c) => c.name === req.params.name);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  chocolate.deleted = true;
  fs.writeFileSync("./data/chocolates.json", JSON.stringify(chocolates, null, 2));
  res.send("Chocolate deleted");
});

// Cart routes
app.post("/carts", (req, res) => {
  const { username, chocolates } = req.body;
  const newCart = {
    username,
    chocolates,
    totalPrice: chocolates.reduce((sum, c) => sum + c.price * c.quantity, 0),
    deleted: false,
  };
  carts.push(newCart);
  fs.writeFileSync("./data/carts.json", JSON.stringify(carts, null, 2));
  res.status(201).send(newCart);
});

app.get("/carts/:username", (req, res) => {
  const cart = carts.find((c) => c.username === req.params.username && !c.deleted);
  if (!cart) {
    return res.status(404).send("Cart not found");
  }
  res.send(cart);
});

app.get("/carts/factory/:factoryName", (req, res) => {
  const factoryCarts = carts.filter((c) => c.chocolates.some(choc => choc.factoryName === req.params.factoryName) && !c.deleted);
  res.send(factoryCarts);
});

app.delete("/carts/:username", (req, res) => {
  const cart = carts.find((c) => c.username === req.params.username);
  if (!cart) {
    return res.status(404).send("Cart not found");
  }
  cart.deleted = true;
  fs.writeFileSync("./data/carts.json", JSON.stringify(carts, null, 2));
  res.send("Cart deleted");
});

// Purchases routes
app.post("/purchases", (req, res) => {
  const { id, chocolates, factoryName, date, totalPrice, username, status } = req.body;
  const newPurchase = {
    id,
    chocolates,
    factoryName,
    date,
    totalPrice,
    username,
    status,
    deleted: false,
  };
  purchases.push(newPurchase);
  fs.writeFileSync("./data/purchases.json", JSON.stringify(purchases, null, 2));
  res.status(201).send(newPurchase);
});

app.get("/purchases", (req, res) => {
  const activePurchases = purchases.filter((p) => !p.deleted);
  res.send(activePurchases);
});

app.get("/purchases/:id", (req, res) => {
  const purchase = purchases.find((p) => p.id === req.params.id && !p.deleted);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  res.send(purchase);
});

app.get("/purchases/factory/:factoryName", (req, res) => {
  const factoryPurchases = purchases.filter((p) => p.factoryName === req.params.factoryName && !p.deleted);
  res.send(factoryPurchases);
});

app.delete("/purchases/:id", (req, res) => {
  const purchase = purchases.find((p) => p.id === req.params.id);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  purchase.deleted = true;
  fs.writeFileSync("./data/purchases.json", JSON.stringify(purchases, null, 2));
  res.send("Purchase deleted");
});

// Comments routes
app.post("/comments", (req, res) => {
  const { username, factoryName, text, rating } = req.body;
  const newComment = {
    username,
    factoryName,
    text,
    rating,
    deleted: false,
  };
  comments.push(newComment);
  fs.writeFileSync("./data/comments.json", JSON.stringify(comments, null, 2));
  res.status(201).send(newComment);
});

app.get("/comments", (req, res) => {
  const activeComments = comments.filter((c) => !c.deleted);
  res.send(activeComments);
});

app.get("/comments/user/:username", (req, res) => {
  const userComments = comments.filter((c) => c.username === req.params.username && !c.deleted);
  res.send(userComments);
});

app.get("/comments/factory/:factoryName", (req, res) => {
  const factoryComments = comments.filter((c) => c.factoryName === req.params.factoryName && !c.deleted);
  res.send(factoryComments);
});

app.delete("/comments/:id", (req, res) => {
  const comment = comments.find((c) => c.id === req.params.id); // Pretpostavlja se da svaki komentar ima jedinstveni ID
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  comment.deleted = true;
  fs.writeFileSync("./data/comments.json", JSON.stringify(comments, null, 2));
  res.send("Comment deleted");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
