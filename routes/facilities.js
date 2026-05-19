const express = require("express");

const router = express.Router();

module.exports = (db) => {

  // ALL FACILITIES
  router.get("/", async (req, res) => {

    const {
      search = "",
      type = "",
      page = 1,
    } = req.query;

    const limit = 9;

    const skip =
      (parseInt(page) - 1) * limit;

    let query = {};

    // SEARCH
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // FILTER
    if (type) {
      query.facility_type = {
        $in: [type],
      };
    }

    const total =
      await db
        .collection("facilities")
        .countDocuments(query);

    const facilities =
      await db
        .collection("facilities")
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

    res.send({
      total,
      facilities,
    });
  });

  return router;
};