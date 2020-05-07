const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

const USER_SCHEMA = `
CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_name VARCHAR(30) NOT NULL UNIQUE, 
    user_email VARCHAR(255) NOT NULL, 
    user_password VARCAHR(255) NOT NULL,
    user_full_name VARCAHR(40) NOT NULL, 
    user_join_date TIMESTAMP DEFAULT current_timestamp
)
`;

const INSERT_DEFAULT_USER_1 = 
`
INSERT INTO user (
    user_name, 
    user_email,
    user_password,
    user_full_name
) SELECT 'hugo', 'vieirahugo587@gmail.com', '123', 'Hugo' WHERE NOT EXISTS (SELECT * FROM user WHERE user_name = 'hugo')
`;

const INSERT_DEFAULT_USER_2 = 
`
INSERT INTO user (
    user_name, 
    user_email,
    user_password,
    user_full_name
) SELECT 'jorge', 'jorge@mello.com.br', '123', 'Jorge' WHERE NOT EXISTS (SELECT * FROM user WHERE user_name = 'jorge')
`;

const PHOTO_DOG_SCHEMA = 
`
CREATE TABLE IF NOT EXISTS photo_dog (
    photo_dog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_dog_post_date TIMESTAMP NOT NULL, 
    photo_dog_url TEXT NOT NULL, 
    photo_dog_description TEXT DEFAULT ('') NOT NULL, 
    photo_dog_allow_comments INTEGER NOT NULL DEFAULT (1), 
    photo_dog_likes BIGINT NOT NULL DEFAULT (0),
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE 
)
`;

const COMMENT_SCHEMA =
`
CREATE TABLE IF NOT EXISTS comment (
    comment_id INTEGER   PRIMARY KEY AUTOINCREMENT,
    comment_date TIMESTAMP NOT NULL,
    comment_text TEXT  DEFAULT (''),
    photo_dog_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (photo_dog_id) REFERENCES photo_dog (photo_dog_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE 
);
`;

const LIKE_SCHEMA = `
CREATE TABLE IF NOT EXISTS like (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    photo_dog_id INTEGER,
    user_id  INTEGER,
    like_date TIMESTAMP DEFAULT current_timestamp, 
    UNIQUE(user_id, photo_dog_id ),
    FOREIGN KEY (photo_dog_id) REFERENCES photo_dog (photo_dog_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
)
`;

db.serialize(() => {
    db.run("PRAGMA foreign_keys=ON");
    db.run(USER_SCHEMA);
    db.run(INSERT_DEFAULT_USER_1);
    db.run(INSERT_DEFAULT_USER_2);
    db.run(PHOTO_DOG_SCHEMA);        
    db.run(COMMENT_SCHEMA);     
    db.run(LIKE_SCHEMA);        

    db.each("SELECT * FROM user", (err, user) => {
        console.log('Users');
        console.log(user);
    });
});

process.on('SIGINT', () =>
    db.close(() => {
        console.log('Database closed');
        process.exit(0);
    })
);

module.exports = db;