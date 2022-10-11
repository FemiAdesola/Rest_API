'use strict';

const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const io = require('../socket');
const User = require('../models/user');

// get posts---------------------------------------------------------
exports.getPosts = async(req, res, next) => {
 // for pagination 
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            // for sorting 
            .sort({ createdAt: -1 })
            //
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        //
        // fetch from dataabse
        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts,
            totalItems: totalItems
        });
    } catch(error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};

// create post ---------------------------------------
exports.createPost = async(req, res, next) => {
    const errors = validationResult(req);
    // error handling 
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422;
        throw error;
    }
    // filestorage for image
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    //
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    // function to create post to database
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        // for having userId from database and connecting user with post 
        // creator: { name: 'Femi' },
        creator:req.userId,
    });
    try {
        await post.save()   
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();

        // for io socket
        io.getIO().emit('posts', {
            action: 'create',
            post: {...post._doc, creator: {
                    _id: req.userId,
                    name: user.name
                }
            }
        });
        //

        res.status(201).json({
            message: 'Post created successfully',
            post: post,
            creator: { _id: user._id, name: user.name }
        });
        //
    } catch(error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
    //
};

// get post --------------------------------------------
exports.getPost = async(req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
   try {
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched',
            post: post
        })
    } catch(error){
        console.log('error in getpost code')
        next(error);
    };
}

// Update post ------------------------------------------------------
exports.updatePost = async(req, res, next) => {
    const postId = req.params.postId;
    // error handling 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    // after checking value we can update by the code below
    try {
        const post = await Post.findById(postId).populate('creator')
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        // for creating authrozation for the user to delete and update
        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        };
        //
        // clear image
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        //
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await post.save();

        // for io socket
        io.getIO().emit('posts', {
            action: 'update',
            post: result
        });
        //
        res.status(200).json({
            message: 'Post updated!',
            post: result
        })
        
    }   catch(error) {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
    }
};

// deletePost ------------------------------------------------------
exports.deletePost = async(req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
         // to check if the post undefined
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
            // for creating authrozation for the user to delete and update
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        };
        //

         // check logged 
         clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        
      // For clearing Post and user relation
        const user = await User.findById(req.userId);
        user.posts.pull(postId)
        await user.save();
    //
        res.status(200).json({
            message: 'Post deleted!'
        });
    }   catch(error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

// for clear image
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, error => console.error(error));
}