import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Button, Col, Dropdown, DropdownButton, Row } from "react-bootstrap";
import DeletePostModal from "./DeletePostModal";
import UpdatePostModal from "./UpdatePostModal";
import { useNavigate } from "react-router-dom";

export default function ProfilePostCard({ post, clickable }) {
  const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const [userDetails, setUserDetails] = useState(null);
  const [likes, setLikes] = useState([]);
  const [postCreatedAt, setPostCreatedAt] = useState("");
  const [modal, setModal] = useState("");

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setModal("");
  };
  const handleShow = (action) => {
    setShow(true);
    setModal(action);
  };

  // Decoding to get the user ID
  const token = localStorage.getItem("authToken");
  const decode = jwtDecode(token);
  const userId = decode.id;

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/profile/${post.user_id}`)
      .then((res) => res.json())
      .then((data) => setUserDetails(data))
      .catch((error) => console.error("Error: ", error));

    fetch(`${process.env.BASE_URL}/likes/post/${post.id}`)
      .then((res) => res.json())
      .then((data) => setLikes(data))
      .catch((error) => console.error("Error: ", error));

    const getPostCreatedTime = () => {
      const createdAt = new Date(post.created_at);

      if (clickable) {
        const currentDate = new Date();
        const timeDifference = Math.abs(currentDate - createdAt) / (1000 * 60 * 60);

        if (createdAt.getFullYear() !== new Date().getFullYear()) {
          // Post created year is not current year
          setPostCreatedAt(`${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getDate()}, ${createdAt.getFullYear()}`);
        }
        else if (timeDifference >= 24) {
          // Post created time is more than 1 day
          setPostCreatedAt(`${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getDate()}`);
        }
        else if (timeDifference >= 1) {
          // Post created time is more than 60 minutes
          setPostCreatedAt(`${Math.floor(timeDifference)}h`);
        }
        else if (Math.floor(timeDifference * 60) === 0) {
          // Post created time less than 1 minute
          setPostCreatedAt("Just now");
        }
        else {
          // Post created time more than 1 minute but less than 60 minutes
          setPostCreatedAt(`${Math.floor(timeDifference * 60)}m`);
        }
      }
      else {
        const createdAtTime = `${createdAt.toLocaleString("default", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit"
        })}`;
        const createdAtDate = `${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getDate()}, ${createdAt.getFullYear()}`;

        setPostCreatedAt(`${createdAtTime} • ${createdAtDate}`);
      }
    };

    getPostCreatedTime();

    const intervalId = setInterval(getPostCreatedTime, 60000);

    return () => clearInterval(intervalId);
  }, [clickable, post]);

  const isLiked = likes.some((like) => like.user_id === userId);

  const handleLike = () => (isLiked ? removeFromLikes() : addToLikes());

  const addToLikes = () => {
    axios.post(`${process.env.BASE_URL}/likes`, {
      user_id: userId,
      post_id: post.id,
    })
      .then((res) => {
        setLikes([...likes, { ...res.data, likes_id: res.data.id }]);
      })
      .catch((error) => console.error("Error: ", error));
  };

  const removeFromLikes = () => {
    const like = likes.find((like) => like.user_id === userId);

    if (like) {
      axios
        .put(`${process.env.BASE_URL}/likes/${userId}/${post.id}`) // Include userId and postId in the URL
        .then(() => {
          // Update the state to reflect the removal of the like
          setLikes(likes.filter((likeItem) => likeItem.user_id !== userId));
        })
        .catch((error) => console.error("Error: ", error));
    }
  };

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/post/${post.id}`, { state: { post, userId } });
  }

  return (
    <>
      <div style={{ cursor: clickable && "pointer" }} onClick={clickable ? handleNavigate : null}>
        <Row
          className="p-3"
          style={{
            borderTop: "1px solid #D3D3D3",
            borderBottom: "1px solid #D3D3D3"
          }}
        >
          {clickable ? (
            <Col sm={1} className="px-0">
              <div className="rounded-circle mx-auto" style={{
                backgroundBlendMode: "multiply",
                backgroundColor: "#ccc",
                backgroundImage: userDetails && userDetails.profileImage && `url(${process.env.BASE_URL}/${userDetails.profileImage.replace(/\\/g, "/")})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                height: 40,
                width: 40,
              }}>
              </div>
            </Col>
          ) : (
            <Col sm={12} className="d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <div className="rounded-circle" style={{
                  backgroundBlendMode: "multiply",
                  backgroundColor: "#ccc",
                  backgroundImage: userDetails && userDetails.profileImage && `url(${process.env.BASE_URL}/${userDetails.profileImage.replace(/\\/g, "/")})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  height: 40,
                  width: 40,
                }}>
                </div>
                <div className="ms-3">
                  <div>
                    <strong>{userDetails && userDetails.name ? userDetails.name : userDetails && userDetails.email.split("@")[0]}</strong>
                  </div>
                  <div>
                    <span className="text-secondary">
                      @{userDetails && userDetails.username ? userDetails.username : userDetails && userDetails.email.split("@")[0]}
                      {clickable && ` • ${postCreatedAt}`}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownButton variant="light" title={<i className="bi bi-three-dots"></i>} disabled={post.user_id !== userId}>
                {post.user_id === userId && (
                  <>
                    <Dropdown.Item onClick={() => handleShow("edit")}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleShow("delete")}>Delete</Dropdown.Item>
                  </>
                )}
              </DropdownButton>
            </Col>
          )}

          <Col>
            {clickable && (
              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0">
                  <strong>{userDetails && userDetails.name ? userDetails.name : userDetails && userDetails.email.split("@")[0]}</strong>
                  <span className="text-secondary ms-1">
                    @{userDetails && userDetails.username ? userDetails.username : userDetails && userDetails.email.split("@")[0]}
                    {clickable && ` • ${postCreatedAt}`}
                  </span>
                </p>

                <DropdownButton variant="light" title={<i className="bi bi-three-dots"></i>} disabled={post.user_id !== userId}>
                  {post.user_id === userId && (
                    <>
                      <Dropdown.Item onClick={() => handleShow("edit")}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleShow("delete")}>Delete</Dropdown.Item>
                    </>
                  )}
                </DropdownButton>
              </div>
            )}
            <p>{post.content}</p>
            {!clickable &&
              <p className="text-secondary" style={{ fontSize: 14 }}>{postCreatedAt}</p>
            }
            <div className="d-flex justify-content-between">
              <Button variant="light">
                <i className="bi bi-chat"></i>
              </Button>
              <Button variant="light">
                <i className="bi bi-repeat"></i>
              </Button>
              <Button variant="light" onClick={handleLike}>
                {isLiked ? (
                  <i className="bi bi-heart-fill text-danger me-2"></i>
                ) : (
                  <i className="bi bi-heart me-2"></i>
                )}
                {likes.length}
              </Button>
              <Button variant="light">
                <i className="bi bi-graph-up me-2"></i>
                {post.views}
              </Button>
              <Button variant="light">
                <i className="bi bi-upload"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      {modal === "edit" ? (
        <UpdatePostModal
          show={show}
          handleClose={handleClose}
          userId={userId}
          post={post}
          BASE_URL={process.env.BASE_URL}
        />
      ) : (
        <DeletePostModal
          show={show}
          handleClose={handleClose}
          userId={userId}
          postId={post.id}
          BASE_URL={process.env.BASE_URL}
        />
      )}
    </>
  );
}
