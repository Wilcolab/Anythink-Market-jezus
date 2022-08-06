import {
  ITEM_FAVORITED,
  ITEM_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
} from "../constants/actionTypes";

const reducer = (state = {}, action) => {
  switch (action.type) {
    case ITEM_FAVORITED:
    case ITEM_UNFAVORITED:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.slug === action.payload.item.slug) {
            return {
              ...item,
              favorited: action.payload.item.favorited,
              favoritesCount: action.payload.item.favoritesCount,
            };
          }
          return item;
        }),
      };
    case SET_PAGE:
      return {
        ...state,
        items: action.payload.items,
        itemsCount: action.payload.itemsCount,
        currentPage: action.page,
      };
    case APPLY_TAG_FILTER:
      return {
        ...state,
        pager: action.pager,
        items: action.payload.items,
        itemsCount: action.payload.itemsCount,
        tab: null,
        tag: action.tag,
        currentPage: 0,
      };
    case HOME_PAGE_LOADED:
      return {
        ...state,
        pager: action.pager,
        tags: action.payload[0].tags,
        items: action.payload[1].items,
        itemsCount: action.payload[1].itemsCount,
        currentPage: 0,
        tab: action.tab,
      };
    case HOME_PAGE_UNLOADED:
      return {};
    case CHANGE_TAB:
      return {
        ...state,
        pager: action.pager,
        items: action.payload.items,
        itemsCount: action.payload.itemsCount,
        tab: action.tab,
        currentPage: 0,
        tag: null,
      };
    case PROFILE_PAGE_LOADED:
    case PROFILE_FAVORITES_PAGE_LOADED:
      return {
        ...state,
        pager: action.pager,
        items: action.payload[1].items,
        itemsCount: action.payload[1].itemsCount,
        currentPage: 0,
      };
    case PROFILE_PAGE_UNLOADED:
    case PROFILE_FAVORITES_PAGE_UNLOADED:
      return {};
    default:
      return state;
  }
};

export default reducer;
