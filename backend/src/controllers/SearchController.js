const Dev = require("../models/Dev");
const ParseStringToArray = require("../utils/ParseStringToArray");

module.exports = {
  async list(req, res) {
    const { latitude, longitude, techs = "" } = req.query;

    const devs = await Dev.find({
      techs: {
        $in: ParseStringToArray(techs) || [],
      },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    });

    return res.json(devs);
  },
};
