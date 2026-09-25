const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// vqUtudZzlwSx4aCZ
const uri =
  "mongodb+srv://smart_deal_DB:vqUtudZzlwSx4aCZ@cluster0.uphhlre.mongodb.net/?appName=Cluster0";
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart Deal is live now");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("smart_db");
    const productsCollection = db.collection("products");
    const usersCollection = db.collection("users");
    const bidsCollection = db.collection("bids");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send("User Already Exists");
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });
    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      result.sort((a, b) => Number(b.bid_price) - Number(a.bid_price));
      res.send(result);
    });
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = email ? { buyer_email: email } : {};
      console.log(query);
      // const cursor = bidsCollection.find();
      const cursor = bidsCollection.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const options = {};
      const result = await productsCollection.updateOne(query, update, options);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Smart Deal is running on port: ${port}`);
});
