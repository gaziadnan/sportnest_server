const express = require("express");

const router = express.Router();

module.exports = (db) => {

  // SAVE BOOKING
  router.post("/", async (req, res) => {

    const booking = req.body;

    const result =
      await db
        .collection("bookings")
        .insertOne(booking);

    res.send(result);
  });

  // USER BOOKINGS
  router.get("/:email", async (req, res) => {

    const email = req.params.email;

    const result =
      await db
        .collection("bookings")
        .find({
          userEmail: email,
        })
        .toArray();

    res.send(result);
  });

  return router;
};