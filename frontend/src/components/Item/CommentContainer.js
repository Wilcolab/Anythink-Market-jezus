import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import { Link } from "react-router-dom";
import React from "react";

const CommentContainer = (props) => {
  if (props.currentUser) {
    return (
      <div className="w-100">
        <CommentList
          comments={props.comments}
          slug={props.slug}
          currentUser={props.currentUser}
        />
        <div className="row">
          <div className="mt-4 col-xs-10 col-md-6">
            <list-errors errors={props.errors}></list-errors>
            <CommentInput slug={props.slug} currentUser={props.currentUser} />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-100">
        <CommentList
          comments={props.comments}
          slug={props.slug}
          currentUser={props.currentUser}
        />
        <p className="m-4 text-dark">
          <Link to="/login" className="text-light">
            Sign in
          </Link>
          &nbsp;or&nbsp;
          <Link to="/register" className="text-light">
            sign up
          </Link>
          &nbsp;to add comments on this item.
        </p>
      </div>
    );
  }
};

export default CommentContainer;
