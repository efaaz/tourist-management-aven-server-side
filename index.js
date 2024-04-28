import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p9odpl5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("tourism").collection("user");
    const spotCollection = client.db("tourism").collection("spotSection");
    const spotsCollection = client.db("tourism").collection("spotsSection");
    const countryCollection = client.db("tourism").collection("countrySection");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // get all countries
    app.get("/countries", async (req, res) => {
      const cursor = countryCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    // get all tourist spots
    app.get("/all/spots", async (req, res) => {
      const cursor = spotsCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });
    app.post("/spots", async (req, res) => {
      const userInfo = req.body;
      console.log(userInfo);
      const result = await spotCollection.insertOne(userInfo);
      res.send(result);
    });

    // temporarily
    app.post("/spotss", async (req, res) => {
      const userInfo = req.body;
      const result = await spotsCollection.insertMany(userInfo);
      res.send(result);
    });



    app.get("/spots/unique", async (req, res) => {
      const uniqueCountriesData = await spotsCollection.aggregate([
        {
          $group: {
            _id: "$country_name",
            firstSpot: { $first: "$$ROOT" }, // Get the first document from each group
            count: { $sum: 1 }, // Optional: Count the number of spots in each group
          },
        },
        {
          $replaceWith: "$firstSpot", // Replace the group with the first document
        },
      ]).toArray();
  
      res.send(uniqueCountriesData); // Send the unique data


    })




    // get 6 tourist spots
    app.get("/spots", async (req, res) => {
      const uniqueCountriesData = await spotsCollection.aggregate([
        {
          $group: {
            _id: "$country_name",
            firstSpot: { $first: "$$ROOT" }, // Get the first document from each group
            count: { $sum: 1 }, // Optional: Count the number of spots in each group
          },
        },
        {
          $replaceWith: "$firstSpot", // Replace the group with the first document
        },
      ]).toArray();
  
      res.send(uniqueCountriesData); // Send the unique data

    });

    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    // Route to get all users with a specific email
    app.get("/spots/user/:email", async (req, res) => {
      const email = req.params.email; // Get the email from URL parameters
      const query = { email: email }; // Filter documents with this email
      const users = await spotCollection.find(query).toArray(); // Fetch matching documents
      res.send(users); // Send the matching documents as the response
    });


    app.put(`/spots/update/:id`, async(req, res) => {
            const id = req.params.id;
            const user = req.body;
            const filter = {_id: new ObjectId(id)}
            const options = { upsert: true };

            const updatedInfo = {
                $set: {
                  name: user.username,
                  email: user.useremail,
                  totaVisitorsPerYear: user.visitorCount,
                  country_Name: user.country,
                  tourists_spot_name: user.SpotName,
                  average_cost: user.cost,
                  image: user.img,
                  travel_time: user.time,
                  location: user.area,
                  seasonality: user.season,
                  short_description: user.description,
                }
            }

            const result = await spotCollection.updateOne(filter, updatedInfo, options);
            res.send(result);
        })


    app.delete('/spots/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await spotCollection.deleteOne(query);
      res.send(result);
  })


    // user related apis
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      // console.log(userInfo);
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    app.patch("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          email: user.email,
          createdAt: user.creationTime,
          lastLoggedAt: user.lastLoggedAt,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, {
        upsert: true,
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
