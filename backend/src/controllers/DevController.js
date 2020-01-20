const axios = require("axios");
const Dev = require("../models/Dev");
const ParseStringToArray = require("../utils/ParseStringToArray");

module.exports = {
  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (dev) {
      return res.status(400).json({ error: "Dev already register" });
    }

    const { data } = await axios.get(
      `https://api.github.com/users/${github_username}`,
    );

    const { name = login, avatar_url, bio } = data;
    dev = await Dev.create({
      name,
      avatar_url,
      bio,
      github_username,
      techs: ParseStringToArray(techs),
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return res.status(201).json(dev);
  },

  async list(req, res) {
    const devs = await Dev.find();
    return res.json(devs);
  },
};
