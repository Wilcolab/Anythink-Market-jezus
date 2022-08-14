import {
  APP_LOAD,
  REDIRECT,
  LOGOUT,
  ITEM_SUBMITTED,
  SETTINGS_SAVED,
  LOGIN,
  REGISTER,
  DELETE_ITEM,
  ITEM_PAGE_UNLOADED,
  EDITOR_PAGE_UNLOADED,
  HOME_PAGE_UNLOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
  SETTINGS_PAGE_UNLOADED,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
} from "../constants/actionTypes";

const defaultState = {
  appName: "Anythink Market",
  token: null,
  viewChangeCounter: 0,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case APP_LOAD:
      return {
        ...state,
        token: action.token || null,
        appLoaded: true,
        currentUser: action.payload ? action.payload.user : null,
      };
    case REDIRECT:
      return { ...state, redirectTo: null };
    case LOGOUT:
      return { ...state, redirectTo: "/", token: null, currentUser: null };
    case ITEM_SUBMITTED: {
      const redirectUrl = `/item/${action.payload.item.slug}`;
      return { ...state, redirectTo: redirectUrl };
    }
    case SETTINGS_SAVED:
      return {
        ...state,
        redirectTo: action.error ? null : "/",
        currentUser: action.error ? null : action.payload.user,
      };
    case LOGIN:
      return {
        ...state,
        redirectTo: action.error ? null : "/",
        token: action.error ? null : action.payload.user.token,
        currentUser: action.error ? null : action.payload.user,
      };
    case REGISTER:
      return {
        ...state,
        redirectTo: action.error ? null : `/@${action.payload.user.username}`,
        token: action.error ? null : action.payload.user.token,
        currentUser: action.error ? null : action.payload.user,
      };
    case DELETE_ITEM:
      return { ...state, redirectTo: "/" };
    case ITEM_PAGE_UNLOADED:
    case EDITOR_PAGE_UNLOADED:
    case HOME_PAGE_UNLOADED:
    case PROFILE_PAGE_UNLOADED:
    case PROFILE_FAVORITES_PAGE_UNLOADED:
    case SETTINGS_PAGE_UNLOADED:
    case LOGIN_PAGE_UNLOADED:
    case REGISTER_PAGE_UNLOADED:
      return { ...state, viewChangeCounter: state.viewChangeCounter + 1 };
    default:
      return state;
  }
};

export default reducer;
