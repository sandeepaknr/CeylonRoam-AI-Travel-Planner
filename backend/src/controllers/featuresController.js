const Location = require("../models/Location");
const Category = require("../models/Category");

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort({ name: 1 });
        res.status(200).json(locations);
    } catch (err) {
        res.status(500).json({ message: "Cannot Fetch Locations", error: err.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const newLocation = new Location(req.body);
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (err) {
        res.status(400).json({ message: "Failed to Insert Location", error: err.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Location Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete Failed" });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: "Cannot Fetch Categories", error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: "Failed to Insert Category", error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete Failed" });
    }
};