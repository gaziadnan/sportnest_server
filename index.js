const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", process.env.FRONTEND_URL],
  credentials: true,
}));

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
    console.log("Connected to MongoDB.");

    const db = client.db("sportnest");
    const facilitiesCollection = db.collection("facilities_collection");
    const bookingsCollection = db.collection("bookings");
    console.log("Collections ready.");

    // ===================== FACILITIES =====================

    app.get("/facilities", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
        console.log(`GET /facilities — page:${page}`);
        const total = await facilitiesCollection.countDocuments();
        const facilities = await facilitiesCollection.find().skip(skip).limit(limit).toArray();
        res.json({ total, facilities });
      } catch (error) {
        console.error("GET /facilities — error:", error.message);
        res.status(500).json({ message: "Failed to fetch facilities" });
      }
    });

    app.get("/facilities/my-facilities", async (req, res) => {
      try {
        const email = req.query.email;
        console.log("GET /my-facilities — email:", email);
        const result = await facilitiesCollection.find({ owner_email: email }).toArray();
        res.json(result);
      } catch (error) {
        console.error("GET /my-facilities — error:", error.message);
        res.status(500).json({ message: "Failed to fetch facilities" });
      }
    });

    app.get("/facilities/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("GET /facilities/:id —", id);
        const result = await facilitiesCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).json({ message: "Facility not found" });
        res.json(result);
      } catch (error) {
        console.error("GET /facilities/:id — error:", error.message);
        res.status(500).json({ message: "Failed to fetch facility" });
      }
    });

    app.post("/facilities", async (req, res) => {
      try {
        console.log("POST /facilities — inserting");
        const result = await facilitiesCollection.insertOne(req.body);
        res.json(result);
      } catch (error) {
        console.error("POST /facilities — error:", error.message);
        res.status(500).json({ message: "Failed to add facility" });
      }
    });

    app.put("/facilities/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        console.log("PUT /facilities/:id —", id);
        const updatedFields = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== "" && data[key] !== null && data[key] !== undefined) {
            updatedFields[key] = data[key];
          }
        });
        const result = await facilitiesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedFields }
        );
        res.json(result);
      } catch (error) {
        console.error("PUT /facilities/:id — error:", error.message);
        res.status(500).json({ message: "Update failed" });
      }
    });

    app.delete("/facilities/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("DELETE /facilities/:id —", id);
        const result = await facilitiesCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.error("DELETE /facilities/:id — error:", error.message);
        res.status(500).json({ message: "Delete failed" });
      }
    });

    // ===================== BOOKINGS =====================

    app.get("/bookings", async (req, res) => {
      try {
        const email = req.query.email;
        console.log("GET /bookings — email:", email);
        const result = await bookingsCollection.find({ userEmail: email }).toArray();
        res.json(result);
      } catch (error) {
        console.error("GET /bookings — error:", error.message);
        res.status(500).json({ message: "Failed to fetch bookings" });
      }
    });

    app.post("/bookings", async (req, res) => {
      try {
        console.log("POST /bookings — inserting");
        const result = await bookingsCollection.insertOne(req.body);
        res.json(result);
      } catch (error) {
        console.error("POST /bookings — error:", error.message);
        res.status(500).json({ message: "Failed to save booking" });
      }
    });

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("DELETE /bookings/:id —", id);
        const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Booking not found" });
        res.json(result);
      } catch (error) {
        console.error("DELETE /bookings/:id — error:", error.message);
        res.status(500).json({ message: "Failed to delete booking" });
      }
    });

    console.log("All routes mounted.");

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

server();

app.get("/", (req, res) => {
  res.send("SportNest server is running.");
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});