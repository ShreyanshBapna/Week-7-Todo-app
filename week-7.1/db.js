const mongoose = require('mongoose');

// mongoose libaray export the class called schema that u can define to make schema 
const Schema = mongoose.Schema;

const ObjectId = mongoose.ObjectId;


const user = new Schema({
    email : {type: String, unique: true},
    password : String,
    name : String
});

const todo = new Schema({
    title : String,
    done : Boolean,
    userId : ObjectId
});

const UserModel = mongoose.model('users', user);
const TodoModel = mongoose.model('todos', todo);

module.exports = {
    UserModel : UserModel,
    TodoModel : TodoModel
}
