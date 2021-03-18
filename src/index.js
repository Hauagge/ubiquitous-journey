const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers  

  const userExist = users.find(user=>user.username===username)

  if(!userExist){
    return response.status(400).json({error:"This user do not exist"})

  }
  
 
  request.username = userExist
 
  return next();
}

app.post('/users', (request, response) => {
 const { name, username} = request.body

const userAlreadyExist = users.some((user)=>user.username===username)

if(userAlreadyExist){
  return response.status(400).json({error:"This username already exist"})
}
 const user  = {
   id: uuidv4(),  
   name,
   username,
   todos: []
  }

 

 users.push(user)
 return response.status(201).json(user)
});

app.get('/users', (requeset,response)=>{
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request

  return response.json(username.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username } = request;
  const {title, deadline} = request.body;
  const newTodo = {
    id: uuidv4(),  
    title,
    done:false,
    deadline:new Date(deadline),
    created_at:new Date()
  }
  username.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { username } = request; 
    const {title, deadline} = request.body;
    const {id}= request.params
  
    const indexTodo= username.todos.findIndex(todo=>todo.id===id)

    if(indexTodo<0){
      return response.status(404).json({error:"Todo not found"})
    }

    username.todos[indexTodo]={
      title,
      deadline,
      done: false
    }
   
    

   

     return response.status(201).json(username.todos[indexTodo])
      

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  
  const findTodo = username.todos.findIndex(todo=>todo.id===id);
  if(findTodo<0){
    return response.status(404).json({error:"Todo not found"})
  }

  username.todos[findTodo]={
   ...username.todos[findTodo],
    done:true
  }

  return response.status(200).json(username.todos[findTodo])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

   const findTodoIndex = username.todos.findIndex(todo => todo.id === id)
   if(findTodoIndex < 0){
    return response.status(404).json({error:"Todo do not exist"})
  }
   
   username.todos.splice(username.todos[findTodoIndex],1)



  return response.status(204).json(username)
});

module.exports = app;