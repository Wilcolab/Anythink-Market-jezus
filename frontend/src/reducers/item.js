import {
  ITEM_PAGE_LOADED,
  ITEM_PAGE_UNLOADED,
  ADD_COMMENT,
  DELETE_COMMENT,
} from "../constants/actionTypes";

const reducer = (state = {}, action) => {
  switch (action.type) {
    case ITEM_PAGE_LOADED:
      return {
        ...state,
        item: action.payload[0].item,
        comments: action.payload[1].comments,
      };
    case ITEM_PAGE_UNLOADED:
      return {};
    case ADD_COMMENT:
      return {
        ...state,
        commentErrors: action.error ? action.payload.errors : null,
        comments: action.error
          ? null
          : (state.comments || []).concat([action.payload.comment]),
      };
    case DELETE_COMMENT: {
      const commentId = action.commentId;
      return {
        ...state,
        comments: state.comments.filter((comment) => comment.id !== commentId),
      };
    }
    default:
      return state;
  }
};

export default reducer;
