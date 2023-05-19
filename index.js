const express = require("express");
require("dotenv").config();
const multer  = require('multer');
const nodemailer = require("nodemailer");
const app = express();  // creating an instance of express
const PORT = 3001;
 

// set different properties 
app.set("view engine", "ejs");  // register the template engine
app.set("views", "./views");    // specify the views directory

// body-parsing middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// serveing static file middleware
app.use(express.static("public"));


// Routes
// get route
app.get("/form", (req, res) =>{
  
  res.render("form",
    {
      title: "post form",
      header: "user info",
    });
});

//the storage engine tells multer were and how to save our file.
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  }
});

//the storage property takes a storage engine.
const upload = multer({storage: fileStorageEngine});

// post route
app.post("/form", upload.single('video'), (req, res) =>{

  // simpleDB cloud connection
  // insert into DB
    async function addData(){
        let header = {
          userid: process.env.MY_TOKEN  // cloud connection token 
        };

        let propertyName = "userinfo";
        
          const {fname, femail, fphone, fage, fcountry} = req.body;
          const data = {
                    fname,
                    femail,
                    fphone,
                    fage,
                    fcountry,
                    video: req.file.filename
                  };

        //sending emails
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mabasomilpo@gmail.com",
            pass: process.env.MY_GMAIL_PASS
            }
        });
        
        let details = {
          from: "mabasomilpo@gmail.com",
          to: data.femail,
          subject: `online Scouting agent`,
          text: `hello, ${data.fname} we have accepted your appication.`
        }
        
        transporter.sendMail(details, (err) =>{
          if(err){
            console.log("something went wrong :" + err);
          }else{
            console.log("email was successfully sent");
          }
        });


        let myJsonData = JSON.stringify(data);
        let url = `https://simpledb.vercel.app/api/add/${propertyName}/${myJsonData}`;
     
        let insert = await fetch(url, {headers: header});
     
        let response = await insert.json();
        
        
        res.render("successful", {
          title: "new user created",
          myArray: response.data
        });

        res.status(200);
         
     };

     return addData();
});


// get route
app.get("/userinfo", (req, res) =>{

  // simpleDB cloud connection
  // select from DB 
  async function getDataBasedOnProperty(){
        let header = {
          userid: process.env.MY_TOKEN // cloud connection token
        };
     
        let propertyName = "userinfo";
        let url = `https://simpledb.vercel.app/api/select/${propertyName}`;
     
        let data = await fetch(url, {headers: header});
     
        //promise to resolve or reject and response with json() 
        let myJsonData = await data.json();   

         return res.render("homePage", 
           {
            title: "user Record",
            message: "Get user information from DataBase",
            data: myJsonData
           });
     };
    
     return getDataBasedOnProperty();
});


// listening for request
app.listen(PORT, (err) => {
    if(err){
        console.log(`Something went wrong: ${err}`);
    }else{
        console.log(`Server listening on PORT ${PORT}`);
    };
});

