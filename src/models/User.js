import bcrypt from "bcrypt";
import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({
    email: {type:String, required: true, unique: true},
    username:{type:String, required: true, unique: true},
    password:{type:String, required: true},
    name:{type:String, required: true},
    location: String,
})
userSchema.pre('save', async function(){ 
    console.log("User's password:", this.password);
    this.password = await bcrypt.hash(this.password, 5, ) //5=saltrounds, async-await사용중이므로 콜백함수 안씀 
    //this: 생성된 user object
    console.log("Hashed Password:",this.password);
})

const User = mongoose.model("User", userSchema)
export default User;