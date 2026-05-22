const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const uri = process.env.DB_URI;

if (!uri) {
  console.error("DB_URI is not defined in environment variables. Exiting.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB connection established successfully.");

    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB ping successful.");

    const db = client.db("sportnest");
    console.log("Database selected: sportnest");

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
      const { id } = req.params;
      console.log(`DELETE /bookings/${id} — request received`);

      try {
        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          console.warn(`DELETE /bookings/${id} — booking not found`);
          return res.status(404).json({ message: "Booking not found" });
        }

        console.log(`DELETE /bookings/${id} — deleted successfully`);
        res.json({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        console.error(`DELETE /bookings/${id} — error:`, error.message);
        res.status(500).json({ message: "Failed to delete booking" });
      }
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

app.get("/", (req, res) => {
  console.log("GET / — health check");
  res.json({ status: "OK", message: "SportNest server is running" });
});

app.use((req, res) => {
  console.warn(`404 — ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});