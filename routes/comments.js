const express = require('express'),
    router = express.Router({mergeParams: true}), // The mergeParams:true this will allow to access the ":id" defined in app.js.
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'); // If we require a directory, it automatically requires the index.js file.

// Nested Routes (start) +++++++++++++++++

// ***** RESTful nested route: NEW route (GET, show item by id)
// /campgrounds/:id/comments/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    // res.send('This will be the Comments form.');
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            req.flash('error', 'Something went wrong with the DataBase.'); // This will be shown on the next page the user is redirected to. This is why it needs to be before the redirect.
            console.log('ERROR: ' + err);
        } else {
            res.render('comments/new', {campground: campground});
        }
    });
});

// ***** RESTful nested route: CREATE route (GET, show item by id)
// /campgrounds/:id/comments
router.post('/', middleware.isLoggedIn, (req, res) => { // Using the isLoggedIn function here prevents anyone from adding a comment through a POST request.
    // res.send('This will be the Comments creation route.');
    // Lookup campground using id
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            req.flash('error', 'Something went wrong with the DataBase.'); // This will be shown on the next page the user is redirected to. This is why it needs to be before the redirect.
            console.log('ERROR: ' + err);
            res.redirect('/campgrounds');
        } else {
            // Create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log('ERROR: ' + err);
                } else {
                    // Add username and id to comment
                    comment.author.id = req.user._id; // From the commentSchema in comment.js
                    comment.author.username = req.user.username; // From the commentSchema in comment.js
                    comment.save();
                    // Connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Comment sucessfully posted.'); // This will be shown on the next page the user is redirected to. This is why it needs to be before the redirect.
                    //Redirect to campground show page
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// ***** RESTful nested route: EDIT route (GET, edit item by id)
// /campgrounds/:id/comments/:comment_id/edit
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    //res.send('EDIT route for a comment.');
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err) {
            res.redirect('back');
        } else {
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// ***** RESTful nested route: UPDATE route (PUT, edit item by id)
// /campgrounds/:id/comments/:comment_id/
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    //res.send('This is the updated comment.');
    // Find and update the correct comment item
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
            if (err) {
                res.redirect('back');
            } else {
                res.redirect('/campgrounds/' + req.params.id);
            }
        });
});

// ***** RESTful nested route: DESTROY route (DELETE, edit item by id)
// /campgrounds/:id/comments/:comment_id/
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    //res.send('This is the DESTROY route.');
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err) {
            req.flash('error', 'Something went wrong with the DataBase.'); // This will be shown on the next page the user is redirected to. This is why it needs to be before the redirect.
            res.redirect('back');
        } else {
            req.flash('success', 'Comment sucessfully deleted.'); // This will be shown on the next page the user is redirected to. This is why it needs to be before the redirect.
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});
// Nested Routes (end) +++++++++++++++++

module.exports = router;