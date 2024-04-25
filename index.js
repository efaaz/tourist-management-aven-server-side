require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');


//  middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p9odpl5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // const UserCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('tourism').collection('user');
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // user related apis
    app.get('/user', async (req, res) => {
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    })

    app.post('/user', async (req, res) => {
        const userInfo = req.body;
        console.log(userInfo);
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
    });

    app.patch('/user', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email }
        const updateDoc = {
            $set: {
                lastLoggedAt: user.lastLoggedAt
            }
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
    })











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send("Server is running")
});

app.listen(port, ()=>{
    console.log(`listening on ${port}`);
});