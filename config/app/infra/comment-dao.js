const commentConverter = row => ({
    date: row.comment_date,
    text: row.comment_text,
    userName: row.user_name
}
)

class CommentDao {

    constructor(db){
        this._db = db;
    }

    add(text, photoDogId, userId){
         return new Promise((resolve,reject)=>{
             this._db.run(
                  `
                  INSERT INTO comment(
                      comment_date,
                      comment_text,
                      photo_dog_id,
                      user_id
                  ) values(?,?,?,?)
                 `
                 ,
                 [
                     new Date(),
                     text,
                     photoDogId,
                     userId
                 ],
                  
                 function(err){
                     if(err){
                         console.log(err)
                         return reject('can `t add comment')
                     }

                     resolve(this.lastID);
                 }); 
         });
    }

            listAllFromPhotoDog(photoDogId){
                return new Promise((resolve,reject)=> {
                    this._db.all(
                        `
                        SELECT
                            c.comment_date, c.comment_text, u.user_name
                        FROM comment as c
                        JOIN user as u ON u.user_id = c.user_id
                        WHERE c.photo_dog_id = ?
                        ORDER BY c.comment_date DESC

                        `,
                        [photoDogId],
                        (err, rows)=> {

                            if(err){
                                console.log(err);
                                return reject('Can`t load comments');

                            }
                            const comments = rows.map(commentConverter);
                            return resolve(comments);

                        })
                });
            }

            findById(commentId){
                return new Promise((resolve, reject)=> {
                    this._db.get(
                        `
                        SELECT 
                            c.comment_date, c.comment_text, u.user_name
                        FROM comment as c
                        JOIN user as u ON u.user_id = c.user_id
                        WHERE c.comment_id = ?

                        `,
                        [commentId],
                        (err,row)=>{
                            console.log(row);
                            if(err){
                                console.log(err);
                                return reject('Can`t load comment');
                            }
                            return resolve(commentConverter(row));
                        }
                    );
                });
            }
}

module.exports = CommentDao;