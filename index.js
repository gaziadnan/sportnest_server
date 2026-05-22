const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", process.env.FRONTEND_URL],
  credentials: true,
}));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function server() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");

    const db = client.db("sportnest");
    console.log("Database: sportnest");

    const facilitiesCollection = db.collection("facilities_collection");
    console.log("Collection ready: facilities_collection");

    const bookingsCollection = db.collection("bookings");
    console.log("Collection ready: bookings");

    const facilitiesRoutes = require("./routes/facilities");
    const bookingsRoutes = require("./routes/bookings");

    app.use("/facilities", facilitiesRoutes(db));
    console.log("Route mounted: /facilities");

    app.use("/bookings", bookingsRoutes(bookingsCollection));
    console.log("Route mounted: /bookings");

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`DELETE /bookings/${id}`);

        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);
        console.log(`Booking ${id} deleted.`);

        res.json(result);
      } catch (error) {
        console.error("Delete booking error:", error.message);
        res.status(500).json({ message: "Failed to delete booking" });
      }
    });

  } finally {
  }
}

server().catch(console.dir);

app.get("/", (req, res) => {
  console.log("GET / — health check");
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});