const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll("#deleteCommentBtn");

const addComment = (text, commentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  const icon = document.createElement("icon");
  const span = document.createElement("span");
  const span2 = document.createElement("span");

  newComment.className = "video__comment";
  icon.className = "comment__icon";
  newComment.appendChild(icon);

  icon.innerText = "👻";

  span.innerText = ` ${text}`;
  span2.innerText = "❌";

  span2.dataset.id = commentId;
  span2.dataset.videoid = videoContainer.dataset.id;
  span2.id = "newDeleteCommentBtn";
  span2.className = "video__comment-delete";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
  const newDeleteCommentBtn = document.querySelector("#newDeleteCommentBtn");
  newDeleteCommentBtn.addEventListener("click", handleClick);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleClick = async (event) => {
  const { id, videoid } = event.target.dataset;
  const response = await fetch(`/api/videos/${videoid}/comments/${id}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, videoid }),
  });
  if (response.status === 200) {
    event.target.parentNode.remove();
  }
};

if (form) form.addEventListener("submit", handleSubmit);
if (deleteBtn)
  deleteBtn.forEach((btn) => btn.addEventListener("click", handleClick));
