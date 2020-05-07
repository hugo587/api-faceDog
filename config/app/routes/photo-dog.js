const { photoDogAPI} = require('../api'),
    path = require('path'),
    { wrapAsync, auth } = require('../infra')

    module.exports = app =>{

        app.route('/:userName/photosDog')
            .get(wrapAsync(photoDogAPI.list));

        app.route('/photosDog/upload')
            .post(auth, app.get('upload').single('imageFile'), wrapAsync(photoDogAPI.addUpload))

        app.route('/photosDog/:photoDogId')
            .post(auth, wrapAsync(photoDogAPI.add))
            .delete(auth, wrapAsync(photoDogAPI.remove))
            .get(wrapAsync(photoDogAPI.findById));

        app.route('/photosDog/:photoDogId/like')
            .post(auth,wrapAsync(photoDogAPI.like));
    };