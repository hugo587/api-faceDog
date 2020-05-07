const { commentAPI } = require('../api'),
    path = require('path'),
    { wrapAsync, auth} = require('../infra')

    module.exports = app =>{

        app.route('photosDog/:photoDogId/comments')
            .get(wrapAsync(commentAPI.listAllFromPhotoDog))
            .post(auth, wrapAsync(commentAPI.add));
    };