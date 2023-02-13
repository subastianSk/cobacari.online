const Product = require("../models/Product");
const User = require("../models/User");
const Comment = require("../models/Comment");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


// create comment
exports.createComment = async (req, res) => {
    try {
        // Verify the JWT token
        if (!req.header("Authorization")) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }

        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }

        // Get the product ID from the request
        const productId = req.params.productId;
        console.log(productId);
        // Get the product details
        const product = await Product.findById(mongoose.Types.ObjectId(productId));

        if (!product) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Product not found"
                },
                data: null
            });
        }

        // Create the comment
        const comment = new Comment({
            user: user._id,
            product: product._id,
            comment: req.body.comment,
            isActive: true
        });

        // Save the comment to the database
        const result = await comment.save();

        // Add the comment to the product
        product.comments.push(result._id);
        await product.save();

        // Add the comment to the user
        user.comments.push(result._id);
        await user.save();

        // Send the response
        res.json({
            status: {
                status: 1,
                message: "Comment created successfully"
            },
            data: result
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};


// Get Comment By ID
exports.getCommentByProduct = async (req, res) => {
    try {
        // Check if the product ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
            return res.status(400).json({
                status: {
                    status: 0,
                    message: "Invalid product ID"
                },
                data: null
            });
        }

        // Get the product and user details
        const product = await Product.findById(req.params.productId).populate({
            path: 'comments',
            match: {
                IsActive: true
            }
        });
        if (!product) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Product not found"
                },
                data: null
            });
        }

        // Send the response
        res.json({
            status: {
                status: 1,
                message: "Comments retrieved successfully"
            },
            data: product.comments
        });
    } catch (error) {
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};


// Edit Comment By Product
exports.editComment = async (req, res) => {
    try {
        // Verify the JWT token
        if (!req.header("Authorization")) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }

        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }

        // Get the comment ID from the request
        const commentId = req.params.commentId;

        // Get the comment details
        const comment = await Comment.findById(mongoose.Types.ObjectId(commentId));

        if (!comment) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Comment not found"
                },
                data: null
            });
        }

        // Check if the user is authorized to edit the comment
        if (comment.user.toString() !== user._id.toString()) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }

        // Update the comment
        comment.comment = req.body.comment;
        const result = await comment.save();

        // Send the response
        res.json({
            status: {
                status: 1,
                message: "Comment updated successfully"
            },
            data: result
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};


// delete comment product by user
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, {
            IsActive: false
        }, {
            new: true
        });
        if (!comment) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Comment not found"
                },
                data: null
            });
        }
        res.status(200).json({
            status: {
                status: 1,
                message: "Comment deleted successfully"
            },
            data: comment
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};