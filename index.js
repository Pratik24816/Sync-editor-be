require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;
const mongoose=require("mongoose");
const Document=require("./Document");
// const express = require('express');

// const app = express();

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB", err));


// app.use(express.json());


const io=require('socket.io')(port,{
    cors:{
        origin:"https://sync-editor-fe.onrender.com",
        methods:["GET","POST"],
       allowedHeaders: ["Content-Type"],
    }
});
const defaultValues="";

io.on("connection",socket=>{

    socket.on("get-document",async documentId=>{
        const document=await findOrCreateDoc(documentId);
        socket.join(documentId);
        socket.emit("load-document",document.data)

        socket.on("send-changes",delta=>{
            socket.broadcast.to(documentId).emit("receive-changes",delta);
            console.log(socket.id);
            console.log(delta);
            console.log(documentId);
        });

        socket.on("save-document",async data=>{
            await Document.findByIdAndUpdate(documentId,{data});
        });
    });

});

async function findOrCreateDoc(id){
    if(id==null)
        return;

    const document=await Document.findById(id);
    if(document)
        return document;

    return await Document.create({_id:id,data:defaultValues});
}

// app.get('/', (req, res) => {
//     res.json({ message: 'Welcome to the API!' });
//   });
  
//   // Start the server
//   app.listen(port, () => {
//     console.log(`Server is running on http://localhost:`);
//   });
