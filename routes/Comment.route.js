const express = require('express');
const router = express.Router();
const commentController = require("../controllers/comment");

// Create a comment
router.post('/products/:productId/comments', commentController.createComment);

// Get Product BY ID
router.get("/products/:productId/comments", commentController.getCommentByProduct);

// Put Product BY ID
router.put("/products/comments/:commentId", commentController.editComment);

// Delete a comment by product ID
router.delete('/comments/:id', commentController.deleteComment);


module.exports = router;