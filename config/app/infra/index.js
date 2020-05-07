const PhotoDogDao = require('./photo-dog-dao'),
    CommentDao = require('./comment-dao'),
    UserDao = require('./user-dao'),
    auth = require('./auth'),
    wrapAsync = require('./async-wrap') ;
    
    module.exports = {
        PhotoDogDao,
        CommentDao,
        UserDao,
        auth,
        wrapAsync
    };