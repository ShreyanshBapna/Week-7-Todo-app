const express = require('express');
const {UserModel, TodoModel} = require('./db')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {z} = require("zod");

mongoose.connect('mongodb+srv://shreyansh:shru%4082230@cluster0.iv297.mongodb.net/todo-website-week-7-2');

const app = express();    


const JWT_SECRET = 'ilovekaira'
app.use(express.json());

app.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email : z.string().email().min(3).max(100),
        password : z.string().min(3).max(30),
        name : z.string().min(3).max(100),
        title : z.string(),
        done : z.boolean()
    })
    // req.body 
    // {
    //   title : string,
    //   done : boolean,
    //   email : string, 
    //   password : string,
    //   name : string
    // }
    const parseData = requiredBody.parse(req.body);  // this will throw an error if their is invalid input happen 
    const parseDataWithSuccess = requiredBody.safeParse(req.body);    // this will return the true and false acc to the input validation 

    // 1. how to show the user the exact error

    if (!parseDataWithSuccess.success){
        res.status(403).json({
            msg : "Incorrect Entry!!",
            error : parseDataWithSuccess.error
        })
        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    let errorThrown = false;

    try {
        const hashPassword = await bcrypt.hash(password, 5);
        await UserModel.create({
            email : email,
            password : hashPassword,
            name : name
        })
    } catch (e){
        res.json({
            msg : 'User are already exists!!'
        })
        errorThrown = true;
    }

    if (!errorThrown){
        res.json({
            msg : 'you are logged-in'
        })
    }
   
});

app.post('/signin',async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email : email,
    });

    if (!user){
        res.status(403).json({
            msg : "User don't exist!!"
        })
        return;
    } 

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if(passwordMatch){
        const token = jwt.sign({
            id : user._id.toString()
        }, JWT_SECRET);
        res.json({
            token : token
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