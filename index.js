const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const bcrypt = require('bcryptjs');
const {findOne} = require("./modles/userSchema");
const User = require("./modles/userSchema");

dotenv.config({ path: "./.env" });
const DB = process.env.DB;
//Database connection start
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log(error);
  });

  //database connection ends

  //required use cases declared start
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
const PORT = process.env.PORT;
app.use(express.json());

  //required use cases declared end

app.post("/register", (req, res) => {
  const {name, password} = req.body;
  if(!name || !password)
  {
    return res.status(422).json({error:"empty spaces"});
  }

  User.findOne({name:name})
  .then((userExist)=>{
      if(userExist){
          return res.status(422).json({error:"username taken"});
      }
  
  
  const user= new User({name,password});
  user.save().then(()=>{
      res.redirect("login.html");
  }).catch((err)=> res.status(500).json({error:"failed"}))
  }).catch(err=>console.log(err));

       
});


app.post("/login", async (req, res) => {
  let tokens;
  try{
const {name,password} = req.body;
if(!name || !password) res.status(404).send("Invalid credentials");

const userLogin = await User.findOne({name:name})


if(userLogin){
const isMatch = await bcrypt.compare(password,userLogin.password);
  if(!isMatch) res.json({error:"invalid credentials"})
  
  else {
    token = await userLogin.generateAuthToken();
res.cookie("jwtoken",token,{
  expires:new Date(Date.now() + 86400000),httpOnly:true
});  
res.redirect("game.html");

}
}
else res.json({error: "invalid credentials"})
}catch(err) {
  console.log(err);
}
});



app.get("/", (req, res) => {
    res.set({
      "Allow-access-Allow-origin": "*",
    });
    console.log(`listening on PORT ${PORT}`);
    return res.redirect("index.html");
  })
  .listen(PORT);
