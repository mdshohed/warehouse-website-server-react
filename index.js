const express = require('express');
const cors = require('cors');
const app = express(); 
require('dotenv').config()
const port = process.env.PORT || 5000; 
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware 
app.use(cors());
app.use(express.json()); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6mgqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('electronicsWarehouse').collection('products');
    console.log('db connected'); 
    
    // product API
    app.get('/products', async(req, res)=>{
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products); 
    })

    // product post
    app.post('/products', async(req, res)=>{
      const newProduct = req.body;
      console.log(newProduct); 
      const result = await productCollection.insertOne(newProduct); 
      res.send(result); 
    })
  }
  finally{

  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
  res.send("Electronics Warehouse running"); 
})

app.listen(port, ()=>{
  console.log("Electronics Warehouse Running: ", port); 
})
