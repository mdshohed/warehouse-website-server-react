const express = require('express');
const cors = require('cors');
const app = express(); 
require('dotenv').config()
const port = process.env.PORT || 5000; 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

//middleware 
app.use(cors());
app.use(express.json()); 

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization; 
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'}); 
  }
  jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(403).send({message: 'Forbidden access'});
    }
    req.decoded = decoded; 
    next(); 
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6mgqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('electronicsWarehouse').collection('products');
    const ItemCollection = client.db('electronicsWarehouse').collection('items'); 
    console.log('db connected'); 

    // AUTH 
    app.post('/login', async(req, res)=>{
      const user = req.body; 
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '30d'
      }); 
      res.send({accessToken}); 
    })
    
    // product API
    app.get('/products', async(req, res)=>{
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products); 
    })

    // product insert
    app.post('/products', async(req, res)=>{
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct); 
      res.send(result); 
    })
    // find one product 
    app.get('/product/:id', async(req, res)=>{
      const id = req.params.id; 
      const query = {_id: ObjectId(id)};
      const product = await productCollection.findOne(query); 
      res.send(product); 
    })

    // Delete Products 
    app.delete('/product/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.deleteOne(query); 
      res.send(result); 
    })

    // Update Product

    app.put('/product/:id', async(req,res)=>{
      const id = req.params.id; 
      const updatedProduct = req.body; 
      const filter = {_id: ObjectId(id)}; 
      const options = {upsert:true}; 
      const updateDoc = {
        $set:{
          quantity: updatedProduct.quantity
        }
      }
      const result = await productCollection.updateOne(filter, updateDoc, options); 
      res.send(result); 
    })

    // Items API

    app.get('/items',verifyJWT, async(req, res)=>{
      const decodedEmail = req.decoded.email; 
      const email = req.query.email; 
      if(email===decodedEmail){
        const query = {email:email};
        const cursor =  ItemCollection.find(query);
        const items = await cursor.toArray(); 
        res.send(items); 
      }
      else {
        res.status(403).send({message: 'forbidden access'}); 
      }
    })

    // insert Items
    app.post('/items', async(req,res)=>{
      const myItem = req.body; 
      const result = await ItemCollection.insertOne(myItem); 
      res.send(result); 
    })

    // delete items
    app.delete('/items/:id', async(req,res)=>{
      const id = req.params.id;
      const email = req.query.email;  
      const query = {_id: ObjectId(id)};
      const result = await ItemCollection.deleteOne(query);
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
