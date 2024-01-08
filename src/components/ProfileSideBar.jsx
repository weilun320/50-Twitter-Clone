import { Button, Col } from "react-bootstrap";
import IconButton from "./IconButton";
import NewPostModal from "./NewPostModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSideBar({ handleLogout }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();

  return (
    <Col
      sm={2}
      className="d-flex flex-column justify-content-start align-items-start bg-light vh-100 position-sticky top-0"
    >
      <IconButton className="bi bi-twitter" isTop />
      <IconButton className="bi bi-house" text="Home" />
      <IconButton className="bi bi-search" text="Explore" onClick={() => navigate("/search")} />
      <IconButton className="bi bi-bell" text="Notifications" />
      <IconButton className="bi bi-envelope" text="Messages" />
      <IconButton className="bi bi-journal-text" text="Lists" />
      <IconButton className="bi bi-bookmark" text="Bookmarks" />
      <IconButton className="bi bi-patch-check" text="Verified" />
      <IconButton className="bi bi-person" text="Profile" onClick={() => navigate("/profile")} />
      <IconButton className="bi bi-filter-circle" text="More" />
      <IconButton
        className="bi bi-door-closed"
        onClick={handleLogout}
        text="Logout"
      />
      <Button className="rounded-pill w-100 mb-3" onClick={handleShow}>
        Tweet
      </Button>

      <NewPostModal show={show} handleClose={handleClose} />
    </Col>
  );
}
