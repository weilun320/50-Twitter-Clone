import { useState } from "react";
import { Col, Form, InputGroup } from "react-bootstrap";
import ProfilePostCard from "../components/ProfilePostCard";

export default function SearchPage() {

  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState([]);

  const handleSearch = () => {
    if (!keyword) {
      return;
    }

    fetch(`${process.env.BASE_URL}/search/${keyword}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error: ", error));
  };

  return (
    <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
      <InputGroup className="my-3">
        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>
        <Form.Control
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" ? handleSearch() : null}
          placeholder="Search"
          type="text"
          value={keyword}
        />
      </InputGroup>
      {posts.length > 0 && posts.map((post) => (
        <ProfilePostCard key={post.id} post={post} clickable={true} />
      ))}
    </Col>
  );
}
