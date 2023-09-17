import User from "../models/User" 
import bcrypt from "bcrypt";

export const getJoin = (req,res) => res.render("join", {pageTitle: "Join"})
export const postJoin = async(req,res) => {
    const { name, username, email, password, password2,location} = req.body;
    const exists = await User.exists({$or : [{username}, {email}]});
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match."
        });
    }
    if(exists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken."
        });
    }
    try{
        await User.create({
            name,
            username,
            email,
            password,
            location,
        }); 
        return res.redirect("/login");
    }catch(error){ 
        return res.status(400).render("join", {
            pageTitle: "Upload Video", 
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req,res) => res.render("login", {pageTitle: "Login"})
export const postLogin = async (req,res)=>{
  //check if account exists
  const {username, password} = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({username});
    if(!user){
        return res
            .status(400)
            .render("login", {
                pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    //check if password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res
        .status(400)
        .render("login", {
            pageTitle,
        errorMessage: "Wrong password",
         });
    }//세션에 정보 추가
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};
export const startGithubLogin = (req,res) => {
    const baseUrl="https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    }
    const params =  new URLSearchParams(config).toString();
    const finalUrl=`${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishGithubLogin = async(req,res) => {
    const baseUrl="https://github.com/login/oauth/access_token"
    const config ={
        client_id: process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code: req.query.code,
    }
   const params = new URLSearchParams(config).toString();
   const finalUrl = `${baseUrl}?${params}`;


   const tokenRequest = await( 
    await fetch(finalUrl, { //fetch로 데이터 받아옴
        method: "POST",//url에 POST request 보내기
        headers:{
            Accept: "application/json",
        },
    })
).json();
   if("access_token" in tokenRequest){
    const {access_token} = tokenRequest;
    const apiUrl ="https://api.github.com";
    const userData = await(
        await fetch(`${apiUrl}/user`, {
            headers:{
                Authorization: `token ${access_token}`,
            },
        })  
    ).json();
    console.log(userData);
    const emailData = await(
        await fetch(`${apiUrl}/user/emails`, {
            headers:{
                Authorization: `token ${access_token}`
                },
            })
        ).json();
        console.log(emailData);
        //깃헙이 주는 list에서 primary이면서 verified된 email객체를 찾기
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login")
        }
        //같은 email를 가진 user가 이미 있다면, 그 유저를 로그인 시켜주기
        const existingUser = await User.findOne({email: emailObj.email});
        if(existingUser){
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/")
        }else{
            //같은 email를 가진 user가 없다면, 계정 생성하기 추가
        }
        }else{
            return res.redirect("/login")
        };


}
export const edit = (req,res) => res.send("Edit User")
export const remove = (req,res) => res.send("Remove User")
export const logout = (req,res) => res.send("Logout")
export const see = (req,res) => res.send("See User")