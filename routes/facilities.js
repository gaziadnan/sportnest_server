const express = require("express");

const {
  ObjectId,
} = require("mongodb");

const router =
  express.Router();

module.exports = (db) => {
  const facilitiesCollection =
    db.collection(
      "facilities_collection"
    );

  /* ALL FACILITIES */
 router.get(
  "/",
  async (req, res) => {
    try {
      const page =
        parseInt(req.query.page) || 1;

      const limit = 9;

      const skip =
        (page - 1) * limit;

      const total =
        await facilitiesCollection.countDocuments();

      const facilities =
        await facilitiesCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();

      res.send({
        total,
        facilities,
      });
    } catch (error) {
      res.status(500).send({
        message:
          "Failed to fetch facilities",
      });
    }
  }
);

  /* MY FACILITIES */
  router.get(
    "/my-facilities",
    async (req, res) => {
      try {
        const email =
          req.query.email;

        const query = {
          owner_email:
            email,
        };

        const result =
          await facilitiesCollection
            .find(query)
            .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({
          message:
            "Failed to fetch facilities",
        });
      }
    }
  );

  /* ADD FACILITY */
  router.post(
    "/",
    async (req, res) => {
      try {
        const facility =
          req.body;

        const result =
          await facilitiesCollection.insertOne(
            facility
          );

        res.send(result);
      } catch (error) {
        res.status(500).send({
          message:
            "Failed to add facility",
        });
      }
    }
  );





  /* UPDATE FACILITY */
router.put(
  "/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const updatedFacility =
        req.body;

      const query = {
        _id: new ObjectId(id),
      };

      const updatedDoc = {
        $set: {
          name:
            updatedFacility.name,

          facility_type:
            updatedFacility.facility_type,

          image:
            updatedFacility.image,

          location:
            updatedFacility.location,

          price_per_hour:
            updatedFacility.price_per_hour,

          capacity:
            updatedFacility.capacity,

          available_slots:
            updatedFacility.available_slots,

          description:
            updatedFacility.description,
        },
      };

      const result =
        await db
          .collection(
            "facilities_collection"
          )
          .updateOne(
            query,
            updatedDoc
          );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message:
          "Failed to update facility",
      });
    }
  }
);



  /* DELETE FACILITY */
  router.delete(
    "/:id",
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
          await facilitiesCollection.deleteOne(
            query
          );

        res.send(result);
      } catch (error) {
        res.status(500).send({
          message:
            "Delete failed",
        });
      }
    }
  );







  // put for editing facility
 /* SINGLE FACILITY */
router.get(
  "/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const result =
        await facilitiesCollection.findOne(
          {
            _id: new ObjectId(
              id
            ),
          }
        );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message:
          "Failed to fetch facility",
      });
    }
  }
);

/* UPDATE FACILITY */
router.put(
  "/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const data =
        req.body;

      const updatedFields =
        {};

      Object.keys(data).forEach(
        (key) => {
          if (
            data[key] !==
              "" &&
            data[key] !==
              null &&
            data[key] !==
              undefined
          ) {
            updatedFields[
              key
            ] = data[key];
          }
        }
      );

      const result =
        await facilitiesCollection.updateOne(
          {
            _id: new ObjectId(
              id
            ),
          },
          {
            $set:
              updatedFields,
          }
        );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message:
          "Update failed",
      });
    }
  }
);

  return router;
};