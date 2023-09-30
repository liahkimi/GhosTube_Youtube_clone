import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  //check if account exists
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false }); //소셜로그인뿐만 아니라 그냥 로그인도 가능
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  //check if password correct
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  } //세션에 정보 추가
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      //fetch로 데이터 받아옴
      method: "POST", //url에 POST request 보내기
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //깃헙이 주는 list에서 primary이면서 verified된 email객체를 찾기
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      //set notification soon!
      return res.redirect("/login");
    }
    //깃헙과 같은 email를 가진 user가 db에 이미 있다면, 그 유저를 로그인 시켜주기
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name, //'김가은'
        username: userData.login, //'liahkimi',
        email: emailObj.email, //똑같은 email주소 가져오기 //'maruanna1994@gmail.com'
        password: "", //아직 계정이 없어서
        socialOnly: true, //소셜로그인으로만 로그인 가능
        location: userData.location,
        //db에 같은 email를 가진 user가 없다면, 유저의 깃헙 정보로 계정 생성하기
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
export const logout = (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
//+ 바꾸려는 username과 email이 db에 이미 있으면, 유저에게 알려주는 코드 짜기(https://github.com/Ryan-Dia/wetube-2022/commit/afe1ef8f3d794ca05e0f0eb343224e333e8decd5 참고)
export const postEdit = async (req, res) => {
  // = const i = req.session.user._id
  //(req.session안의 user object에서 user id 찾기)
  const {
    //session에는 user object가 있고, 우리는 거기에 있는 정보를 사용할 수 있음.
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location }, //req.body에서 얻은 데이터
    file,
  } = req;
  //findByIdAndUpdate(_id,UpdateQuery)
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.location : avatarUrl,
      //file이 업데이트된게 있으면 file.path값을 avatarUrl에 대입하고, 업데이트된게 없으면 기존 avatarUrl 쓴다.
      //절대 DB에는 파일을 저장하지 않는다. 대신 파일의 위치를 저장한다!!
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  // //세션 업데이트
  // req.session.user = {
  //     ...req.session.user, //나머지것들은(email,username..) 기존의것과 같음.
  //     name, //form의 value값으로 업데이트
  //     email,
  //     username,
  //     location,
  // }
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  //깃허브로그인 유저는 password가 없으니, 못바꾸게 제한
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  //어떤유저가 변경하고 싶어하는지
  const {
    //세션의 user 정보
    session: {
      user: { _id },
    },
    //form에서 정보가져오기
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  //현재 DB user정보 => user로 최신 업데이트된 데이터를 가져오므로, 일일히 세션 업데이트 해줄 필요없다.
  const user = await User.findById(_id);
  //기존 비번과 유저가 input에 입력한 기존비번이 동일한지 확인
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The Current Password is incorrect ",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    //브라우저가 패스워드 변경할것인지 상태변경 메시지 안뜨게  status(400)설정
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The Password does not match the confirmation ",
    });
  }
  //최종, 비번 변경해주기
  user.password = newPassword;
  await user.save(); //User.js의 pre save도 작동되서 hashing된다.
  req.flash("info", "Password updated");

  //send notification : 비밀번호를 변경하셨군요!!
  return res.redirect("/users/logout"); //비번 변경되면 로그아웃시키기
};
export const see = async (req, res) => {
  const { id } = req.params; //url에 있는 user의 id 찾아옴
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  //db에 id를 검색하고 mongoose가 그 id를 가져다가 모든 영상을 프로필창에 보여줌
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", {
    //render 작업하기
    pageTitle: user.name,
    user, //user를 변수로 users/profile로 보냄
  });
};
