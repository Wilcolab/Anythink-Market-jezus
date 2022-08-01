import { Link } from "react-router-dom";
import React from "react";
import agent from "../../agent";
import { connect } from "react-redux";
import { DELETE_ITEM } from "../../constants/actionTypes";

const mapDispatchToProps = (dispatch) => ({
  onClickDelete: (payload) => dispatch({ type: DELETE_ITEM, payload }),
});

const ItemActions = (props) => {
  const item = props.item;
  const del = () => {
    props.onClickDelete(agent.Items.del(item.slug));
  };
  if (props.canModify) {
    return (
      <span>
        <Link
          to={`/editor/${item.slug}`}
          className="btn btn-outline-dark btn-sm mr-2"
        >
          <i className="ion-edit"></i> Edit Item
        </Link>

        <button className="btn btn-outline-danger btn-sm" onClick={del}>
          <i className="ion-trash-a"></i> Delete Item
        </button>
      </span>
    );
  }

  return <span></span>;
};

export default connect(() => ({}), mapDispatchToProps)(ItemActions);
