const { PhotoDogDao, UserDao } = require('../infra'),
jimp = require('jimp'),
path = require('path'),
fs = require('fs'),
unlink = require('util').promisify(fs.unlink);

const api = {}

const userCanDelete = user => photoDog => photoDog.userId == user.id;

const defaultExtension = '.jpg';

api.list = async(req,res)=>{
    console.log('#####################');
    const { userName } = req.params;
    const { page } = req.query;
    const user = await new UserDao(req.db).findByName(userName);

    if(user){
        console.log(`Listing photos`);
        const photosDog = await new PhotoDogDao(req.db)
            .listAllFromUser(userName,page);
            res.json(photosDog);

    }else{
        res.status(404).json({message: 'User not found'});
    }
}

api.add = async(req,res) => {
    console.log('######################');
    console.log('Received JSON data ', req.body);
    const photoDog = req.body;
    photoDog.file = '';
    const id = await new PhotoDogDao(req.db).add(photoDog, req.user.id);
    res.json(id);

};

api.addUpload = async(req,res) => {
    console.log('Upload complete');
    console.log('Photo Data', req.body);
    console.log('File info', req.file);

    const image = await jimp.read(req.file.path);

    await image
        .exifRotate()
        .cover(460,460)
        .autocrop()
        .write(req.file.path);

    const photoDog = req.body;
    photoDog.url = path.basename(req.file.path);
    await new PhotoDogDao(req.db).add(photoDog, req.user.id);
    res.status(200).end();
};

api.findById = async(req,res) => {
    const { photoDogId } = req.params;
    console.log('###########################');
    console.log(`Finding photo for ID ${photoDogId}`)
    const photoDog = await new PhotoDogDao(req.db).findById(photoDogId);

    if(photoDog){
        res.json(photoDog);
    }else{
        res.status(404).json({message: 'Photo does not exist'})
    }
};

api.remove = async(req, res) => {
    const user = req.user;
    const { photoDogId } = req.params;
    const dao = new PhotoDogDao(req.db);
    const photoDog = await dao.findById(photoDogId);

    if(!photoDog){
        const message = 'Photo does not exit';
        console.log(message);
        return res.status(404).json({message})
    }

    if(userCanDelete(user)(photoDog)){
        await dao.remove(photoDogId)
        console.log(`Photo ${photoDogId} deleted!`);
        res.status(200).end();
    }else{
        console.log(
            `
            Forbiden operation. User ${user.id}
            can delete photo from user ${photoDog.userId}
            `
        );
        res.status(403).json({message: 'Forbiden'});
    }
};

api.like = async(req,res) => {
    const { photoDogId } = req.params;
    const dao = new PhotoDogDao(req.db);
    const liked = await dao.likeById(photoDogId, req.user.id);

    if(liked){
        console.log(`User ${req.user.name} liked photo ${photoDogId}`);
        return res.status(201).end();
    }

    return res.status(304).end();
};

module.exports = api;