const express = require("express");
require("dotenv").config();
const multer  = require('multer');
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();  // creating an instance of express
const PORT = 3001;
 

// set different properties 
app.set("view engine", "ejs");  // register the template engine
app.set("views", "./views");    // specify the views directory

// body-parsing middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// serveing static file middleware
app.use(express.static("images"));
app.use(express.static("videos"));
// Here we expose your dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Routes
// get route
app.get("/form", (req, res) =>{
  
  res.render("form",
    {
      title: "post form",
      header: "user info",
    });
});

//the storage engine tells multer were and how to save our video files.
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname === 'image'){
      cb(null, "./images");
    } else if(file.fieldname === 'video'){     
      cb(null, "./videos");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname +'-'+Date.now() + path.extname(file.originalname));
  }
});


//the storage property takes a storage engine.
const upload = multer({storage: fileStorageEngine});
const uploadMulitpleFields = upload.fields([{name: "image", maxCount: 1},
{name: "video", maxCount: 1}])

// post route
app.post("/form",  uploadMulitpleFields, (req, res) =>{
  // simpleDB cloud connection
  // insert into DB
    async function addData(){
        let header = {
          userid: "h99w92"  // cloud connection token 
        };

        let propertyName = "userinfo";
        
          const {fname, femail, fphone, fage, fcountry} = req.body;
          const data = {
                    fname,
                    femail,
                    fphone,
                    fage,
                    fcountry,
                    image: req.files.image[0].filename,
                    video: req.files.video[0].filename
                  }; 

                  console.log(req.body);
                  console.log(req.files);     

        //sending emails
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mabasomilpo@gmail.com",
            pass: "bspjzvpnmgsbfhaq"
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
          userid: "h99w92" // cloud connection token
        };
     
        let propertyName = "userinfo";
        let url = `https://simpledb.vercel.app/api/select/${propertyName}`;
     
        let data = await fetch(url, {headers: header});
     
        //promise to resolve or reject and response with json() 
        let myJsonData = await data.json();   

         return res.render("homePage", 
           {
            title: "user Record",
            message: "Online Scouting Platform",
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

