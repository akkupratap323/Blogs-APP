const {model,Schema} = require('mongoose');

const blogSchema = new Schema({
  tittle:{
    type:String,
    required:true
  }, 
    body:{
        type:String,
        required:true
    },
    Image:{
        type:String,
        required:false,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'Blog Users'
    }
})

const Blog = model('Blog',blogSchema);

module.exports = Blog;