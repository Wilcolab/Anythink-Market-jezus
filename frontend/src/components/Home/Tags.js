import React from "react";
import agent from "../../agent";

const Tags = (props) => {
  const tags = props.tags;
  if (tags) {
    return (
      <div className="container text-center">
        <span className="pr-2">Popular tags: </span>
        <span className="tag-list">
          {tags.map((tag) => {
            const handleClick = (ev) => {
              ev.preventDefault();
              props.onClickTag(
                tag,
                (page) => agent.Items.byTag(tag, page),
                agent.Items.byTag(tag)
              );
            };

            return (
              <button
                type="button"
                key={tag}
                className="btn badge badge-secondary p-2 m-1"
                onClick={handleClick}
              >
                {tag}
              </button>
            );
          })}
        </span>
      </div>
    );
  } else {
    return <div>Loading Tags...</div>;
  }
};

export default Tags;
