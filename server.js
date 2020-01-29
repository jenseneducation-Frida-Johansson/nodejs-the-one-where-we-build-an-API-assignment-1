const express = require("express");
const app = express();

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

app.use(express.json());

db.defaults({
  cart: {},
  products: [
    {
      id: 1,
      name: "Kruka",
      price: 399,
      imageUrl:
        "https://pixabay.com/get/5fe5d4444252b108feda8460825668204022dfe05b51704c77287ad5/flower-951780_1920.jpg"
    },
    {
      id: 2,
      name: "Vas",
      price: 499,
      imageUrl:
        "https://pixabay.com/get/54e0dd414350ae14f6d1867dda6d49214b6ac3e456597148702c7bd69e/home-2082922_1920.jpg"
    },
    {
      id: 3,
      name: "Ljusstake",
      price: 199,
      imageUrl:
        "https://pixabay.com/get/55e1d34a4d56aa14f6d1867dda6d49214b6ac3e456597148702d73d79f/candlestick-3169746_1920.jpg"
    },
    {
      id: 4,
      name: "Bordslampa",
      price: 1199,
      imageUrl:
        "https://pixabay.com/get/5fe7d2434c5bb108feda8460825668204022dfe05b51704c762c7add/table-lamp-977069_1920.jpg"
    },
    {
      id: 5,
      name: "Stol",
      price: 1999,
      imageUrl:
        "https://pixabay.com/get/54e5d2454352aa14f6d1867dda6d49214b6ac3e456597148702d7bdc93/architecture-2576906_1920.jpg"
    }
  ]
}).write();

app.get("/products", (request, response) => {
  response.json(db.get("products").value());
});

app.get("/cart/:id", (request, response) => {
  response.json(db.get(`cart[${request.params.id}]`).value());
});

app.post("/cart/:id", (request, response) => {
  const oldData = db.get(`cart[${request.params.id}]`).value();

  // Om kundvagnen med :id inte finns, skapa upp den automatiskt
  if (!oldData) {
    db.set(`cart[${request.params.id}]`, []).write();
  }

  // Kolla om det finns produkter i katalogen med samma id som den man skickar in
  const productsInCatalogWithId = db
    .get(`products`)
    .filter({ id: request.body.productId })
    .value();

  if (productsInCatalogWithId.length === 0) {
    return response.status(400).json({ error: "The product does not exist" });
  }

  // Kolla om det finns produkter i varukorgen med samma id som den man skickar in
  const oldDataWithSameProduct = db
    .get(`cart[${request.params.id}]`)
    .filter({ productId: request.body.productId })
    .value();

  if (oldDataWithSameProduct.length > 0) {
    return response
      .status(400)
      .json({ error: "You are not allowed to add the same product again" });
  }

  response.json(
    db
      .get(`cart[${request.params.id}]`)
      .push(request.body)
      .write()
  );
});

app.delete("/cart/:id/:productId", (request, response) => {
  // Kolla om det finns produkter i varukorgen med samma id som den man vill ta bort
  const oldDataWithSameProduct = db
    .get(`cart[${request.params.id}]`)
    .filter({ productId: parseInt(request.params.productId) })
    .value();

  if (oldDataWithSameProduct.length === 0) {
    return response
      .status(400)
      .json({ error: "The product is not in the cart" });
  }

  response.json(
    db
      .get(`cart[${request.params.id}]`)
      .remove({ productId: parseInt(request.params.productId) })
      .write()
  );
});

const port = process.env.PORT || 8000;
app.listen(port);
