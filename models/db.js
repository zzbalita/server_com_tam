const mongoose = require('mongoose');
require('dotenv').config(); // su dung thu vien doc file env:   npm install dotenv --save
const DB_NAME = process.env.DB_NAME;

mongoose.connect('mongodb+srv://root:Nhutren123@cluster0.9rgefph.mongodb.net/'+ DB_NAME)
        .catch( (err) =>{
                console.log("Loi ket noi CSDL");
                console.log(err);
        });
        
module.exports = {mongoose}
