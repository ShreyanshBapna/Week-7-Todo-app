const express = require('express');
const {UserModel, TodoModel} = require('./db')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyansh:shru%4082230@cluster0.iv297.mongodb.net/todo-website');

const app = express();


const JWT_SECRET = 'ilovekaira'
app.use(express.json());

app.post('/signup', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email : email,
        password : password,
        name : name
    })

    res.json({
        msg : 'you are logged-in'
    })
});

app.post('/signin',async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email : email,
        password : password
    });

    console.log(user);

    if (user){
        // this is called incripted 
        console.log(user._id); 
        console.log(typeof(user._id)); 
        const token = jwt.sign({
            id : user._id.toString()
        }, JWT_SECRET);
        res.json({
            token : token
        })
    } else {
        // 403 -> means u are not authorized 
        res.status(403).json({
            msg : "Invalid Credentials"
        })
    }
});

function auth (req, res, next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET);
    if (decodedData){
        req.userId = decodedData.id;
        next();
    } else {
        res.status(403).json({
            msg : "Invalid Credential !!"
        })
    }
}

// for creating a todo for the user 
app.post('/todo', auth, async (req, res) => {
    const userId = req.userId;
    const title = req.body.title ;
    const done = req.body.done;

    await TodoModel.create({
        title : title,
        done : done,
        userId : userId
    })

    res.json({
        userId 
    })
});

// 
app.get('/todos', auth, async (req, res) => {
    const userId = req.userId;
    const todos = await TodoModel.findOne({
        userId
    })
    res.json({
        todos
    })
});

app.listen(3000);