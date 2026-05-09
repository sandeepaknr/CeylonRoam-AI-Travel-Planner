const Location = require("../models/Location");

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ 
        message: "Can not Fetch Location", 
        error: err.message 
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newLocation = new Location({ name, description });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(400).json({ message: "Faild to Insert", error: err.message });
  }
};