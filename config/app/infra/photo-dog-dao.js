const photoDogConverter = row => ({
    id: row.photo_dog_id,
    postDate: new Date(row.photo_dog_post_date),
    url: row.photo_dog_url,
    description: row.photo_dog_description,
    allowComments: row.photo_dog_allow_comments == 'true' ? true : false,
    likes: row.likes,
    comments: row.comments,
    userId: row.user_id,
});

const commentConverter = row => ({
    date: row.comment_date,
    text: row.comment_text,
    userName: row.user_name
})

const maxRows = 12;

class PhotoDogDao{

    constructor(db){
        this._db = db;
    }

    listAllFromUser(userName,page){
        const from = (page - 1 ) * maxRows;

        let limitQuery = '';
        if(page) limitQuery = `LIMIT ${from}, ${maxRows}`;

        return new Promise((resolve,reject)=>{
            this._db.all(
                `
                SELECT p.*,
                    (SELECT COUNT(c.comment_id)
                     FROM comment as c
                     WHERE c.photo_dog_id = p.photo_dog_id
                    ) as comments,

                    (SELECT COUNT(l.like_id)
                        FROM like as l 
                        WHERE l.photo_dog_id = p.photo_dog_id
                    ) as likes
                    FROM photo_dog as p
                        JOIN
                        user as u ON p.user_id = u.user_id
                    WHERE u.user_name = ? 
                    ORDER BY p.photo_dog_post_date DESC
                    ${limitQuery};
                `,
                  [userName],
                  (err,rows)=>{
                      const photosDog = rows.map(photoDogConverter)
                      if(err){
                          console.log(err)
                          return reject('Can`t list photo');
                      }
                      console.log('photos retornadas');
                      resolve(photosDog);
                  });
        });
    }
        add(photo_dog, user_id){
            return new Promise((resolve,reject)=>{
                this._db.run(
                    `
                    INSERT INTO photo_dog(
                        photo_dog_post_date,
                        photo_dog_url,
                        photo_dog_description,
                        photo_dog_allow_comments,
                        user_id
                    )values(?,?,?,?,?)
                    `,
                    [
                        new Date(),
                        photo_dog.url,
                        photo_dog.description,
                        photo_dog.allowComments,
                        user_id
                    ],
                    function(err){
                        if(err){
                            console.log(err);
                            return reject('Can`t add photo');
                        }

                        resolve(this.lastID);
                    }
                );
            });
        }
        findById(id){
            return new Promise((resolve,reject)=> this._db.get(`
                SELECT p.*,
                (SELECT COUNT(c.comment_id)
                FROM comment as c
                WHERE c.photo_dog_id = p.photo_dog_id
                ) as comments,
                (SELECT COUNT(l.like_id)
                    FROM like as l
                    WHERE l.photo_dog_id = p.photo_dog_id
                ) as likes
                FROM photo_dog as p
                WHERE p.photo_dog_id =?
                ORDER BY p.photo_dog_post_date DESC;

            `,
             [id],
             (err,row)=> {
                 if(err){
                     console.log(err)
                     return reject('Can`t find photo')
                 }
                 if(row){
                     resolve(photoDogConverter(row));
                 } else{
                     resolve(null);
                 }
             }

            ));
        }

        remove(id){
            return new Promise((resolve,reject)=> this._db.run (`
             DELETE FROM photo_dog WHERE photo_dog_id = ?`,
             [id],
              err =>{
                  if(err){
                      console.log(err)
                      return reject('Can`t remove photo');
                  }
                  resolve();
              }));
        }

        addComment(text,photoDogId,userId){
            return new Promise((resolve,reject)=>{
                this._db.run(`
                    INSERT INTO comment(
                        comment_date,
                        comment_text,
                        photo_dog_id,
                        user_id
                    )values(?,?,?,?)
                `,

                [
                    new Date(),
                    text,
                    photoDogId,
                    userId,
                ],
                function(err){
                    if(err){
                        console.log(err);
                        return reject('Can`t add comment');
                    }
                    resolve(this.lastID);
                }
                );
            });
        }

        getCommentsFromPhoto(photoDogId){
            return new Promise((resolve,reject)=>{
                this._db.all(
                    `
                    SELECT 
                        c.comment_date, c.comment_text,u.user_name
                        FROM comment as c
                        JOIN user as u ON u.user_id = c.user_id
                        WHERE c.photo_dog_id =?
                        ORDER BY c.comment_date DESC
                    `,
                    [photoDogId],
                    (err,rows) =>{
                        if(err){
                            console.log(err)
                            return reject('Can`t load comments')
                        }
                        const comments = rows.map(commentConverter);
                        return resolve(comments);
                    }
                );
            });
        }

        findCommentById(commentId){
            return new Promise((resolve,reject)=>{
                this._db.get(`
                SELECT 
                c.comment_date,c.comment_text, u.user_name
                FROM comment as c
                JOIN user as u ON u.user_id = c.user_id
                WHERE c.comment_id = ?
                `,
                [commentId],
                (err,row)=>{
                    console.log(err);
                    if(err){
                        console.log(err);
                        return reject('Can`t load comment');
                    }
                    return resolve(commentConverter(row));
                });
            });
        }

        likeById(photoDogId,userId){
            return new Promise((resolve,reject)=> this._db.run(
                `
                INSERT OR IGNORE INTO like
                (photo_dog_id, user_id)
                VALUES(?,?) 
                `,
                [photoDogId,userId],
                function(err){
                    if(err){
                        console.log(err);
                        return reject('Can`t like photo');
                    }

                    resolve(!!this.changes);
                }

            ))

        }
}

module.exports = PhotoDogDao;
