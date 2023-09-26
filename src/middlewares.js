import multer from "multer";
//로컬미들웨어 - locals에 저장하는 모든 정보는 views(pug)에서 전역 사용 가능
export const localsMiddleware = (req,res,next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {}; //loggedInUser = 현재 로그인된 유저
    next();
}

//로그인되어 있어야 실행시키는 것을 허락해주는 미들웨어
export const protectorMiddleware =  (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    }else{
        return res.redirect("/login"); 
    }
}


//로그아웃되어 있어야 실행시키는 것을 허락해주는 미들웨어
export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next();
    }else { 
        return res.redirect("/");
    }
}

//유저가 업로드한 아바타 파일을 uploads폴더의 avatars 폴더에 저장하도록 설정된 multer미들웨어
export const avatarUpload = multer({dest: "uploads/avatars/", limits : {
    fileSize: 3000000,
}})
//유저가 업로드한 비디오 파일을 uploads 폴더의 a
export const videoUpload = multer({dest: "uploads/videos/", limits : {
    fileSize: 100000000,
}})