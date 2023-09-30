import Video from "../models/video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  //populate을 통해 mongoose가 video모델을 찾고, 그 안에서 owner도 찾아줌
  //mongoose는 Video모델에서 owner가 Object Id인것을 알고, 이 ObjectId도 User모델에서 온 것임을 안다.
  //user의 id뿐만 아니라, 모든 정보를 알 수 있음
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  //로그인된 유저가 영상주인이 아니면 수정 못하게 보호하기
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  //로그인된 유저가 영상주인이 아니면 수정 못하게 보호하기
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku
        ? thumb[0].location.replace(/[\\]/g, "/")
        : video[0].path.replace(/[\\]/g, "/"), //파일경로를 윈도우는 \\가 아닌 /를 써야해서 정규식으로 변환
      owner: _id, //user의 id를 Video의 owner에 추가함
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id); //user의 id를 찾아서
    user.videos.push(newVideo._id); //새로업로드한 비디오의 owner를 user model의 video array에 추가함

    user.save(); //user 저장소에 저장함 => 로그인하면서 한번 hash된 pw가 한번 더 hash되어서 로그인 할 수 없음
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

//조회수 기록 (템플릿을 렌더링하지 않음. url변경x. 백엔드에 조회수+1 정보만 전송 처리함)
//interactivity : url이 바뀌지 않아도, 페이지에 변화가 생기는 것!
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); //sendStatus:상태코드를 보내고 연결 끝냄
  }
  video.meta.views = video.meta.views + 1;
  await video.save(); //수정된 data를 db에 저장하기 위한 save function
  return res.sendStatus(200); // =ok
};

export const createComment = async (req, res) => {
  const {
    session: { user }, //댓글을 쓴 유저정보
    body: { text }, //댓글정보
    params: { id }, //댓글 달 비디오 정보
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};
export const deleteComment = async (req, res) => {
  const { id, videoid } = req.body; // comment id, video id
  const { _id } = req.session.user; // user id
  const { owner } = await Comment.findById(id);
  const video = await Video.findById(videoid);
  if (String(owner) !== _id) return res.sendStatus(403);
  else {
    await Comment.findByIdAndDelete(id);
    video.comments.splice(video.comments.indexOf(videoid), 1);
    video.save();
    return res.sendStatus(200);
  }
};
