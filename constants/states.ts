import ROUTES from "./routes";

export const DEFAULT_EMPTY = {
  title: "No data found",
  message:
    "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add data",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "Oops! Something went wrong.",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Try Again",
    href: ROUTES.HOME,
  },
};

export const EMPTY_QUESTION = {
  title: "Ahh, No Questions Yet!",
  message:
    "The question board is empty. Maybe it's waiting for you to ask something.",
  button: {
    text: "Ask a question",
    href: ROUTES.ASK_QUESTION,
  },
};

export const EMPTY_TAGS = {
  title: "No Tags Found",
  message: "The Tag Cloud is empty. Add some keywords to make it rain.",
  button: {
    text: "Create Tag",
    href: ROUTES.TAGS,
  },
};

export const EMPTY_COLLECTIONS = {
  title: "Collections are empty",
  message:
    "Looks like you haven't created any collections yet. Start curating something extraordinary today",
  button: {
    text: "Save to collection",
    href: ROUTES.COLLECTION,
  },
};
