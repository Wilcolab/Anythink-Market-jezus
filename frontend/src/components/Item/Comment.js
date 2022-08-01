import DeleteButton from "./DeleteButton";
import { Link } from "react-router-dom";
import React from "react";

const Comment = (props) => {
  const comment = props.comment;
  const show =
    props.currentUser && props.currentUser.username === comment.seller.username;
  return (
    <div className="col-xs-10 col-md-6">
      <div className="card m-2 shadow-sm" style={{ minHeight: "200px" }}>
        <div className="card-body d-flex flex-column">
          <p className="card-text flex-grow-1">{comment.body}</p>
          <div className="d-flex flex-row align-items-center pt-2">
            <Link to={`/@${comment.seller.username}`} className="user-pic mr-2">
              <img
                src={comment.seller.image}
                className="user-pic rounded-circle"
                alt={comment.seller.username}
              />
            </Link>
            &nbsp;
            <Link to={`/@${comment.seller.username}`}>
              {comment.seller.username}
            </Link>
            <span className="text-light mx-2">|</span>
            <span className="flex-grow-1">
              {new Date(comment.createdAt).toDateString()}
            </span>
            <DeleteButton
              show={show}
              slug={props.slug}
              commentId={comment.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
