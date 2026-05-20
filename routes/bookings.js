const express = require("express");

const router = express.Router();

const { ObjectId } = require("mongodb");


router.delete(
  "/bookings/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const query = {
        _id: new ObjectId(
          id
        ),
      };

      const result =
        await bookingsCollection.deleteOne(
          query
        );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message:
          "Failed to delete booking",
      });
    }
  }
);


module.exports = (
  bookingsCollection
) => {
  /* POST BOOKING */
  router.post(
    "/",
    async (req, res) => {
      try {
        const booking =
          req.body;

        const result =
          await bookingsCollection.insertOne(
            booking
          );

        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({
            message:
              "Failed to save booking",
          });
      }
    }
  );

  /* GET MY BOOKINGS */
  router.get(
    "/",
    async (req, res) => {
      const email =
        req.query.email;

      const query = {
        userEmail: email,
      };

      const result =
        await bookingsCollection
          .find(query)
          .toArray();

      res.send(result);
    }
  );

  /* DELETE BOOKING */
  router.delete(
    "/:id",
    async (req, res) => {
      const id =
        req.params.id;

      const query = {
        _id: new ObjectId(id),
      };

      const result =
        await bookingsCollection.deleteOne(
          query
        );

      res.send(result);
    }
  );

  return router;
};