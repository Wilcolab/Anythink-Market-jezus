import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ITEM_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR,
} from "../constants/actionTypes";

const reducer = (state = {}, action) => {
  switch (action.type) {
    case EDITOR_PAGE_LOADED:
      return {
        ...state,
        itemSlug: action.payload ? action.payload.item.slug : "",
        title: action.payload ? action.payload.item.title : "",
        description: action.payload ? action.payload.item.description : "",
        image: action.payload ? action.payload.item.image : "",
        tagInput: "",
        tagList: action.payload ? action.payload.item.tagList : [],
      };
    case EDITOR_PAGE_UNLOADED:
      return {};
    case ITEM_SUBMITTED:
      return {
        ...state,
        inProgress: null,
        errors: action.error ? action.payload.errors : null,
      };
    case ASYNC_START:
      if (action.subtype === ITEM_SUBMITTED) {
        return { ...state, inProgress: true };
      }
      break;
    case ADD_TAG:
      return {
        ...state,
        tagList: state.tagList.concat([state.tagInput]),
        tagInput: "",
      };
    case REMOVE_TAG:
      return {
        ...state,
        tagList: state.tagList.filter((tag) => tag !== action.tag),
      };
    case UPDATE_FIELD_EDITOR:
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }

  return state;
};

export default reducer;
