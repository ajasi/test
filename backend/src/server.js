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
const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
const carts = JSON.parse(fs.readFileSync("./data/carts.json", "utf-8"));
const customerTypes = JSON.parse(fs.readFileSync("./data/customerTypes.json", "utf-8"));

// Helper functions
const saveData = (data, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getNextId = (items) => {
  const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
  return maxId + 1;
};

const isValidAddress = (address) => {
  const regex = /^[^,]+,\s*[^,]+,\s*\d+$/;
  return regex.test(address);
};

// Middleware for checking user roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const username = req.headers['username'];
    const user = users.find(u => u.username === username && !u.deleted);

    if (!user || !user.loggedIn) {
      return res.status(401).send("User not logged in");
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).send("Access denied");
    }
    next();
  };
};

const checkManagerOrWorker = (req, res, next) => {
  const username = req.headers['username'];
  const user = users.find(u => u.username === username && !u.deleted);

  if (!user || !user.loggedIn) {
    return res.status(401).send("User not logged in");
  }

  if (user.role === 'Manager' && user.factoryId !== parseInt(req.params.id)) {
    return res.status(403).send("Access denied");
  }

  if (user.role === 'Worker' && user.factoryId !== parseInt(req.params.id)) {
    return res.status(403).send("Access denied");
  }

  next();
};

// User routes
app.post("/register", (req, res) => {
  const { username, password, firstName, lastName, gender, birthDate, role, factoryId } = req.body;
  const allowedRoles = ['Customer', 'Worker', 'Manager', 'Administrator'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).send('Invalid role');
  }

  const creatingUsername = req.headers['username'];
  let creatingUser = null;

  if (creatingUsername) {
    creatingUser = users.find(user => user.username === creatingUsername && !user.deleted);

    if (!creatingUser || !creatingUser.loggedIn) {
      return res.status(401).send('Invalid credentials');
    }

    if (role === 'Manager' && creatingUser.role !== 'Administrator') {
      return res.status(403).send('Only Administrator can create a Manager');
    }

    if (role === 'Worker') {
      if (creatingUser.role !== 'Manager') {
        return res.status(403).send('Only Manager can create a Worker');
      }
      req.body.factoryId = creatingUser.factoryId;
    }
  } else {
    if (role !== 'Customer') {
      return res.status(403).send('Only Customer can be created without authentication');
    }
  }

  if (role === 'Manager' || role === 'Worker') {
    const factory = data.find(f => f.id === req.body.factoryId && !f.deleted);
    if (!factory) {
      return res.status(400).send('Invalid factory ID');
    }
    if (role === 'Manager') {
      const existingManager = users.find(user => user.role === 'Manager' && user.factoryId === req.body.factoryId && !user.deleted);
      if (existingManager) {
        return res.status(400).send('A non-deleted manager already exists for this factory');
      }
    }
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).send('Username already exists');
  }

  const newUser = { 
    username, 
    password, 
    firstName, 
    lastName, 
    gender, 
    birthDate, 
    role, 
    factoryId: role !== 'Customer' ? req.body.factoryId : null, 
    deleted: false, 
    loggedIn: false,
    cartId: null,
    purchaseIds: [],
    points: 0,
    customerTypeId: null
  };

  if (role === 'Customer') {
    const newCart = {
      id: getNextId(carts),
      items: []
    };
    carts.push(newCart);
    newUser.cartId = newCart.id;
  }

  users.push(newUser);
  saveData(users, './data/users.json');
  saveData(carts, './data/carts.json');
  res.status(201).send(newUser);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password && !user.deleted);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }
  user.loggedIn = true;
  saveData(users, './data/users.json');
  res.send(user);
});

app.post("/logout", (req, res) => {
  const username = req.headers['username'];
  const user = users.find(user => user.username === username && user.loggedIn && !user.deleted);
  if (!user) {
    return res.status(401).send('User not logged in');
  }
  user.loggedIn = false;
  saveData(users, './data/users.json');
  res.send('User logged out');
});

app.put("/users/:username", checkRole(['Administrator']), (req, res) => {
  const user = users.find(u => u.username === req.params.username && !u.deleted);
  if (!user) {
    return res.status(404).send('User not found');
  }
  const { password, firstName, lastName, gender, birthDate, role, factoryId, cartId, purchaseIds, points, customerTypeId } = req.body;

  if (role && user.role === 'Customer' && role === 'Manager') {
    return res.status(403).send('Customer cannot change role to Manager');
  }

  if (['Manager', 'Worker'].includes(role)) {
    const factory = data.find(f => f.id === factoryId && !f.deleted);
    if (!factory) {
      return res.status(400).send('Invalid factory ID');
    }
    if (role === 'Manager') {
      const existingManager = users.find(user => user.role === 'Manager' && user.factoryId === factoryId && !user.deleted);
      if (existingManager) {
        return res.status(400).send('A non-deleted manager already exists for this factory');
      }
    }
  }

  if (password) user.password = password;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (gender) user.gender = gender;
  if (birthDate) user.birthDate = birthDate;
  if (role) user.role = role;
  if (factoryId) user.factoryId = factoryId;
  if (cartId) user.cartId = cartId;
  if (purchaseIds) user.purchaseIds = purchaseIds;
  if (points) user.points = points;
  if (customerTypeId) user.customerTypeId = customerTypeId;

  saveData(users, './data/users.json');
  res.send('User updated');
});

app.delete("/users/:username", checkRole(['Administrator']), (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) {
    return res.status(404).send('User not found');
  }
  user.deleted = true;
  saveData(users, './data/users.json');
  res.send('User deleted');
});

// Factories routes
app.post("/factories", checkRole(['Administrator']), (req, res) => {
  const { name, location, workingHours, logo, managerId } = req.body;
  if (!name || !location || !workingHours || !logo || !managerId) {
    return res.status(400).send('Name, location, working hours, logo, and manager are required');
  }
  if (!isValidAddress(location.address)) {
    return res.status(400).send('Invalid address format. Expected format: [street and number], [city], [postal code]');
  }
  const manager = users.find(user => user.id === managerId && user.role === 'Manager');
  if (!manager || manager.factoryId !== null) {
    return res.status(400).send('Manager is already assigned to another factory or does not exist');
  }
  manager.factoryId = getNextId(data);  // Assign manager to the new factory

  const newFactory = {
    id: getNextId(data),
    name,
    location,
    workingHours,
    status: 'active',
    logo,
    managerId,
    rating: 0,
    comments: [],
    chocolates: [],
    purchases: [],
    deleted: false,
  };
  data.push(newFactory);
  saveData(data, './data/factories.json');
  saveData(users, './data/users.json');
  res.status(201).send(newFactory);
});

app.get("/factories", (req, res) => {
  const activeFactories = data.filter((f) => !f.deleted);
  res.send(activeFactories);
});

app.get("/factories/:id", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const manager = users.find(user => user.id === factory.managerId && !user.deleted);
  factory.manager = manager ? { id: manager.id, username: manager.username, firstName: manager.firstName, lastName: manager.lastName } : null;
  res.send(factory);
});

app.get("/factories/name/:name", (req, res) => {
  const factory = data.find((f) => f.name === req.params.name && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const manager = users.find(user => user.id === factory.managerId && !user.deleted);
  factory.manager = manager ? { id: manager.id, username: manager.username, firstName: manager.firstName, lastName: manager.lastName } : null;
  res.send(factory);
});

app.put("/factories/:id", checkRole(['Administrator', 'Manager']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { name, location, workingHours, status, logo, rating } = req.body;
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).send('Rating must be between 1 and 5');
  }
  if (location && !isValidAddress(location.address)) {
    return res.status(400).send('Invalid address format. Expected format: [street and number], [city], [postal code]');
  }
  if (name) factory.name = name;
  if (location) factory.location = location;
  if (workingHours) factory.workingHours = workingHours;
  if (status) factory.status = status;
  if (logo) factory.logo = logo;
  if (rating) factory.rating = rating;

  saveData(data, './data/factories.json');
  res.send("Factory updated");
});

app.delete("/factories/:id", checkRole(['Administrator']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id));
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  factory.deleted = true;
  saveData(data, './data/factories.json');
  res.send("Factory deleted");
});

// Chocolates routes
app.post("/factories/:id/chocolates", checkManagerOrWorker, (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }

  const username = req.headers['username'];
  const user = users.find(u => u.username === username && !u.deleted);

  if (user.role !== 'Manager') {
    return res.status(403).send("Only Managers can create chocolates");
  }

  const { name, price, type, kind, weight, description, image } = req.body;
  const newChocolate = {
    id: getNextId(factory.chocolates),
    name,
    price,
    type,
    kind,
    weight,
    description,
    image,
    status: "Out of stock",
    quantity: 0,
    deleted: false,
  };
  factory.chocolates.push(newChocolate);
  saveData(data, './data/factories.json');
  res.status(201).send(newChocolate);
});

app.get("/factories/:id/chocolates", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activeChocolates = factory.chocolates.filter((c) => !c.deleted);
  res.send(activeChocolates);
});

app.get("/factories/:id/chocolates/:chocolateId", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.id === parseInt(req.params.chocolateId) && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  res.send(chocolate);
});

app.get("/factories/:id/chocolates/name/:chocolateName", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.name === req.params.chocolateName && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  res.send(chocolate);
});

app.put("/factories/:id/chocolates/:chocolateId", checkManagerOrWorker, (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.id === parseInt(req.params.chocolateId) && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }

  const username = req.headers['username'];
  const user = users.find(u => u.username === username && !u.deleted);

  if (user.role === 'Worker') {
    const { quantity } = req.body;
    if (quantity !== null) chocolate.quantity = quantity;
    chocolate.status = quantity > 0 ? "In stock" : "Out of stock";
  } else {
    const { name, price, type, kind, weight, description, image, quantity } = req.body;
    if (name) chocolate.name = name;
    if (price) chocolate.price = price;
    if (type) chocolate.type = type;
    if (kind) chocolate.kind = kind;
    if (weight) chocolate.weight = weight;
    if (description) chocolate.description = description;
    if (image) chocolate.image = image;
    if (quantity !== null) chocolate.quantity = quantity;
    chocolate.status = quantity > 0 ? "In stock" : "Out of stock";
  }

  saveData(data, './data/factories.json');
  res.send("Chocolate updated");
});

app.delete("/factories/:id/chocolates/:chocolateId", checkRole(['Administrator', 'Manager']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id));
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const chocolate = factory.chocolates.find((c) => c.id === parseInt(req.params.chocolateId));
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }
  chocolate.deleted = true;
  saveData(data, './data/factories.json');
  res.send("Chocolate deleted");
});

// Purchases routes
app.post("/factories/:id/purchases", checkRole(['Customer']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { chocolates, date, totalPrice, username, status } = req.body;
  const newPurchase = {
    id: getNextId(factory.purchases),
    chocolates,
    date,
    totalPrice,
    username,
    status,
    deleted: false,
  };
  factory.purchases.push(newPurchase);
  saveData(data, './data/factories.json');
  res.status(201).send(newPurchase);
});

app.get("/factories/:id/purchases", checkRole(['Administrator', 'Manager', 'Worker']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activePurchases = factory.purchases.filter((p) => !p.deleted);
  res.send(activePurchases);
});

app.get("/factories/:id/purchases/:purchaseId", checkRole(['Administrator', 'Manager', 'Worker']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.purchaseId) && !p.deleted);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  res.send(purchase);
});

app.put("/factories/:id/purchases/:purchaseId", checkRole(['Administrator', 'Manager', 'Worker']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.purchaseId) && !p.deleted);
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  const { chocolates, date, totalPrice, username, status } = req.body;
  if (chocolates) purchase.chocolates = chocolates;
  if (date) purchase.date = date;
  if (totalPrice) purchase.totalPrice = totalPrice;
  if (username) purchase.username = username;
  if (status) purchase.status = status;

  saveData(data, './data/factories.json');
  res.send("Purchase updated");
});

app.delete("/factories/:id/purchases/:purchaseId", checkRole(['Administrator', 'Manager', 'Worker']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id));
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const purchase = factory.purchases.find((p) => p.id === parseInt(req.params.purchaseId));
  if (!purchase) {
    return res.status(404).send("Purchase not found");
  }
  purchase.deleted = true;
  saveData(data, './data/factories.json');
  res.send("Purchase deleted");
});

// Comments routes
app.post("/factories/:id/comments", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const { username, text, rating } = req.body;
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).send('Rating must be between 1 and 5');
  }
  const newComment = {
    id: getNextId(factory.comments),
    username,
    text,
    rating: rating || null,
    approved: false,
    deleted: false,
  };
  factory.comments.push(newComment);
  saveData(data, './data/factories.json');
  res.status(201).send(newComment);
});

app.get("/factories/:id/comments", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const activeComments = factory.comments.filter((c) => !c.deleted);
  res.send(activeComments);
});

app.get("/factories/:id/comments/:commentId", (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.commentId) && !c.deleted);
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  res.send(comment);
});

app.put("/factories/:id/comments/:commentId", checkRole(['Administrator', 'Manager']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id) && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.commentId) && !c.deleted);
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  const { text, rating, approved } = req.body;
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).send('Rating must be between 1 and 5');
  }
  if (text) comment.text = text;
  if (rating) comment.rating = rating;
  if (approved !== undefined) comment.approved = approved;

  saveData(data, './data/factories.json');
  res.send("Comment updated");
});

app.delete("/factories/:id/comments/:commentId", checkRole(['Administrator', 'Manager']), (req, res) => {
  const factory = data.find((f) => f.id === parseInt(req.params.id));
  if (!factory) {
    return res.status(404).send("Factory not found");
  }
  const comment = factory.comments.find((c) => c.id === parseInt(req.params.commentId));
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  comment.deleted = true;
  saveData(data, './data/factories.json');
  res.send("Comment deleted");
});

// Cart routes
app.post("/cart", checkRole(['Customer']), (req, res) => {
  const username = req.headers['username'];
  const user = users.find(u => u.username === username && !u.deleted);
  const { chocolateId, factoryId, quantity } = req.body;

  const factory = data.find(f => f.id === factoryId && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }

  const chocolate = factory.chocolates.find(c => c.id === chocolateId && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }

  const cart = carts.find(c => c.id === user.cartId);
  const existingItem = cart.items.find(item => item.chocolateId === chocolateId && item.factoryId === factoryId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > chocolate.quantity) {
      return res.status(400).send("Quantity exceeds available stock");
    }
    existingItem.quantity = newQuantity;
  } else {
    if (quantity > chocolate.quantity) {
      return res.status(400).send("Quantity exceeds available stock");
    }
    cart.items.push({ chocolateId, factoryId, quantity });
  }

  saveData(carts, './data/carts.json');
  res.status(201).send(cart);
});

app.get("/cart/:username", checkRole(['Customer']), (req, res) => {
  const user = users.find(u => u.username === req.params.username && !u.deleted);
  if (!user) {
    return res.status(404).send("User not found");
  }
  if (user.username !== req.headers['username']) {
    return res.status(403).send("Access denied");
  }
  const cart = carts.find(c => c.id === user.cartId);
  if (!cart) {
    return res.status(404).send("Cart not found");
  }

  const cartDetails = cart.items.map(item => {
    const factory = data.find(f => f.id === item.factoryId);
    const chocolate = factory.chocolates.find(c => c.id === item.chocolateId);
    return {
      chocolateId: item.chocolateId,
      factoryId: item.factoryId,
      quantity: item.quantity,
      factoryName: factory.name,
      chocolate,
      totalPrice: item.quantity * chocolate.price
    };
  });

  res.send(cartDetails);
});

app.put("/cart/:username", checkRole(['Customer']), (req, res) => {
  const user = users.find(u => u.username === req.params.username && !u.deleted);
  if (!user) {
    return res.status(404).send("User not found");
  }
  if (user.username !== req.headers['username']) {
    return res.status(403).send("Access denied");
  }
  const { chocolateId, factoryId, quantity } = req.body;

  const cart = carts.find(c => c.id === user.cartId);
  const item = cart.items.find(i => i.chocolateId === chocolateId && i.factoryId === factoryId);
  if (!item) {
    return res.status(404).send("Item not found in cart");
  }

  const factory = data.find(f => f.id === factoryId && !f.deleted);
  if (!factory) {
    return res.status(404).send("Factory not found");
  }

  const chocolate = factory.chocolates.find(c => c.id === chocolateId && !c.deleted);
  if (!chocolate) {
    return res.status(404).send("Chocolate not found");
  }

  if (quantity > chocolate.quantity) {
    return res.status(400).send("Quantity exceeds available stock");
  }

  item.quantity = quantity;
  saveData(carts, './data/carts.json');
  res.send(cart);
});

app.delete("/cart/:username", checkRole(['Customer']), (req, res) => {
  const user = users.find(u => u.username === req.params.username && !u.deleted);
  if (!user) {
    return res.status(404).send("User not found");
  }
  if (user.username !== req.headers['username']) {
    return res.status(403).send("Access denied");
  }
  const { chocolateId, factoryId } = req.body;

  const cart = carts.find(c => c.id === user.cartId);
  const itemIndex = cart.items.findIndex(i => i.chocolateId === chocolateId && i.factoryId === factoryId);
  if (itemIndex === -1) {
    return res.status(404).send("Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  saveData(carts, './data/carts.json');
  res.send(cart);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
