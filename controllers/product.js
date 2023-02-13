const Product = require("../models/Product");
const upload = require("../middlewares/uploads");
const multer = require('multer');
const User = require("../models/User")
const jwt = require("jsonwebtoken");
const fs = require("fs-extra");
const path = require("path");
const mongoose = require("mongoose");



// create product
exports.createProduct = async (req, res) => {
    // Get the JWT token from the request header
    const token = req.header("Authorization");
    console.log({
        token
    });
    if (!token) {
        return res.status(401).json({
            status: {
                status: 0,
                message: "Access denied. No token provided."
            }
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get the user information from the decoded token
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(400).json({
                status: {
                    status: 0,
                    message: "Invalid token."
                },
                data: null
            });
        }

        // Get the product information from the request body
        const {
            Title,
            Price,
            Address,
            Description,
            Tag,
            Unit,
            geometry
        } = req.body;

        const parsedGeometry = JSON.parse(geometry);

        // Check if image is present in the request
        if (!req.files) {
            return res.status(400).json({
                status: {
                    status: 0,
                    message: "No image found."
                },
                data: null
            });
        }

        // Create the product
        const product = new Product({
            Title,
            Price,
            Address,
            Description,
            Tag,
            Unit,
            location: {
                type: "Point",
                coordinates: parsedGeometry
            },
            imageUrl: req.files.map(x => `images/${x.filename}`)
        });

        // Save the product to the database
        const result = await product.save();

        // Return success response
        res.status(201).json({
            status: {
                status: 1,
                message: "Product created successfully"
            },
            data: result
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};


// get by id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(mongoose.Types.ObjectId(req.params.id)).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'username'
            }
        }).exec();
        if (!product) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Product not found"
                }
            });
        }
        const result = await product;
        // Return success response
        res.status(200).json({
            status: {
                status: 1,
                message: "Get Product by ID"
            },
            data: {
                Title: result.Title,
                Price: result.Price,
                Address: result.Address,
                Description: result.Description,
                Tag: result.Tag,
                Unit: result.Unit,
                imageUrl: result.imageUrl,
                location: result.location,
                comments: result.comments.map(comment => ({
                    username: comment.user.username,
                    text: comment.comment
                }))
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};




// get all product
exports.getAllProduct = async (req, res) => {
    try {
        const products = await Product.aggregate([{
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [Number(req.query.lng), Number(req.query.lat)]
                    },
                    maxDistance: 10000,
                    distanceField: "dist.calculated",
                    spherical: true
                }
            },
            {
                $match: {
                    IsActive: true
                }
            }
        ])

        if (!products) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Error occured"
                }
            });
        }
        const result = products.map(product => {
            return {
                Title: product.Title,
                Price: product.Price,
                Description: product.Description,
                imageUrl: product.imageUrl
            }
        });
        // Return success response
        res.status(200).json({
            status: {
                status: 1,
                message: "Get ALL Product"
            },
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};



// edit product
exports.editProduct = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            Title,
            Price,
            Address,
            Description,
            Tag,
            Unit,
            geometry
        } = req.body;
        // Verify JWT token
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Delete previous image
        fs.unlink(`public/${product.imageUrl}`, (err) => {
            if (err && err.code !== 'EPERM') {
                console.error(err);
            }
        });

        // Update product information
        const imageUrl = req.file ? `images/${req.file.filename}` : product.imageUrl;
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            Title,
            Price,
            Address,
            Description,
            Tag,
            Unit,
            geometry,
            imageUrl
        }, {
            new: true
        });

        // Return success response
        res.status(200).json({
            status: {
                status: 1,
                message: "Product updated successfully"
            },
            data: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};



// delete product
exports.deleteProduct = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const updatedData = await Product.updateOne({
            _id: id
        }, {
            $set: {
                IsActive: false
            },
        });
        if (updatedData.modifiedCount === 1) {
            res.send({
                status: {
                    status: 1,
                    message: "Delete Product successfully"
                },
                data: updatedData
            });
        } else {
            res.send({
                status: {
                    status: 0,
                    message: "Product Is Not Delete",
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}