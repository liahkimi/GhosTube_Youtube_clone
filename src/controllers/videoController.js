import Video  from "../models/video";
import User from "../models/User";

export const home = async(req,res) => {
    const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
        return res.render("home", {pageTitle: "Home", videos});
};


export const watch = async(req, res) => {
    const { id }  = req.params;
    const video = await Video.findById(id).populate("owner");
    //populate을 통해 mongoose가 video모델을 찾고, 그 안에서 owner도 찾아줌
    //mongoose는 Video모델에서 owner가 Object Id인것을 알고, 이 ObjectId도 User모델에서 온 것임을 안다.
    //user의 id뿐만 아니라, 모든 정보를 알 수 있음
    if(!video){
    return res.render("404", {pageTitle: "Video not found."});
    }
    return res.render("watch", {pageTitle: video.title, video});
};


export const getEdit = async(req, res) => {
    const { id }  = req.params;
    const {user: {_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
    return res.status(404).render("404", {pageTitle: "Video not found."});
    }
    //로그인된 유저가 영상주인이 아니면 수정 못하게 보호하기
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle: `Edit ${video.title}`, video});
};


export const postEdit = async(req, res) =>{
    const { id }  = req.params;
    const {user: {_id},} = req.session;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({_id:id});
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video not found."});
    }
    //로그인된 유저가 영상주인이 아니면 수정 못하게 보호하기
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags:Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);
}; 


export const getUpload = (req, res) => { 
    return res.render("upload", {pageTitle: "Upload Video"});
};


export const postUpload = async(req, res) => {
    const {
        user: {_id},
    } = req.session;
    const {path: fileUrl} = req.file;
    const {title, description, hashtags} = req.body;
     try{
        const newVideo = await Video.create({
        title,
        description,
        fileUrl,
        owner: _id ,//user의 id를 Video의 owner에 추가함
        hashtags:Video.formatHashtags(hashtags),
        }); 
        const user = await User.findById(_id);//user의 id를 찾아서
        user.videos.push(newVideo._id);//새로업로드한 비디오의 owner를 user model의 video array에 추가함

        user.save();//user 저장소에 저장함 => 로그인하면서 한번 hash된 pw가 한번 더 hash되어서 로그인 할 수 없음
        return res.redirect("/");
    }catch(error){ 
        return res.status(400).render("upload", {
            pageTitle: "Upload Video", 
            errorMessage: error._message,
        });
    }
};

export const deleteVideo = async(req, res) => {
    const {id} = req.params;
    const {user: {_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video not found."});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/")
}

export const search = async(req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if(keyword){
      videos = await Video.find({
        title: {
            $regex: new RegExp(keyword, "i" ),
        },
     }).populate("owner");
    }
    return res.render("search", {pageTitle:"Search", videos});
}

//조회수 기록 (템플릿을 렌더링하지 않음. url변경x. 백엔드에 조회수+1 정보만 전송 처리함)
//interactivity : url이 바뀌지 않아도, 페이지에 변화가 생기는 것!
export const registerView = async(req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.sendStatus(404);//sendStatus:상태코드를 보내고 연결 끝냄
    }
    video.meta.views = video.meta.views + 1;
    await video.save();//수정된 data를 db에 저장하기 위한 save function
    return res.sendStatus(200);// =ok
};