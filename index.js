
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");//ai line ta add kore amra cors middleware use korechi, jate amra cross-origin resource sharing (CORS) support korte pari, jate amra onno domain theke amader server e request korte pari.
require("dotenv").config(); // ai line ta add kore amra .env file theke environment variable load korechi, jate amra database uri ke environment variable hishebe use korte pari.
const app = express();
const port = process.env.PORT || 8000;



app.use(express.json());
app.use(cookieParser());
app.use(cors()); // ai line ta add kore amra cors middleware use korechi, jate amra cross-origin resource sharing (CORS) support korte pari, jate amra onno domain theke amader server e request korte pari.



//copy from mongobd driver documentation step 1: npm install mongodb.

const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function server() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 }); // aita hide kore amra akhon sever a connect korbo

    const db = client.db("sportnest"); // test database e connect korchi



    const facilitiesCollection = db.collection("facilities_collection"); // products collection e connect korchi


    app.get("/facilities", async (req, res) => {
      const cursor = facilitiesCollection.find();
      const result = await cursor.toArray();
      res.json(result); //res.send() use kora jay but res.json() use korle json format e data send kore, tai amra res.json() use korechi.
    });


    const bookingsCollection = db.collection("bookings_collection"); // products collection e connect korchi


    app.get("/bookings", async (req, res) => {
      const cursor = bookingsCollection.find();
      const result = await cursor.toArray();
      res.json(result); //res.send() use kora jay but res.json() use korle json format e data send kore, tai amra res.json() use korechi.
    });




    const facilitiesRoutes =
  require("./routes/facilities");

const bookingsRoutes =
  require("./routes/bookings");

app.use(
  "/facilities",
  facilitiesRoutes(db)
);

app.use(
  "/bookings",
  bookingsRoutes(db)
);













































 

    // Get a single product by ID

    app.get("/facilities/:id", async (req, res) => {

      const id = req.params.id;

      const query = {
        _id: new ObjectId(id),
      };

      const result =
        await facilitiesCollection.findOne(query);

      res.send(result);
    });


    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    //jdi connect na hoi tahole amara 3 ta  step folow korte pari
    // 1. amra mongbd te 0.0.0.0 ip address add korte pari, 2. ekta cloudflare vpn use korte pari, 3. first a to amra mongbd r URI SRV ta on  kora link ta nibojni na hoi off kore link ta use korte pari.or amra amader first 2 ta line add kore nita pari
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close(); open rakhte hobe karon amra server e connect thakbo and jdi close kori tahole abar connect korte hobe and jdi close na kori tahole abar connect korte hobe na.
  }
}
server().catch(console.dir);











app.get("/", (req, res) => {
  res.send("Hello World");
});
// ai part tok lagbei other wise run hobe na

app.listen(port, () => {
  console.log(`Server is running on  ${port}  PORT`);
});
