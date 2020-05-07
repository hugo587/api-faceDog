const { CommentDao, PhotoDogDao} = require('../infra');

const userCanComment = userId => photoDog =>
    photoDog.allowComments || photoDog.userId === userId;


    const api = {};

    api.add = async(req,res) => {
        
        const { photoDogId } = req.params;
        const { commentText } = req.body;

        const commentDao = new CommentDao(req.db);
        const photoDogDao = new PhotoDogDao(req.db);

        const photoDog = await photoDogDao.findById(photoDogId);
        const canComment = userCanComment(req.user.id)(photoDog);

        if(canComment){
            const commentId = await commentDao.add(commentText,photoDog.id,req.user.id);
            const comment = await commentDao.findById(commentId);
            console.log(`Comment added`,comment);
            res.json(comment);
        }else{
            res.status(403).json({ message: 'Forbiden'});
        }
    };
    
    api.listAllFromPhotoDog = async (req,res) => {

        const {photoDogId} = req.params;
        console.log(`Get comments from photo ${photoDogId}`);
        const comments = await new CommentDao(req.db).listAllFromPhotoDog(photoDogId);
         
        res.json(comments);
    }

    module.exports = api;
    
