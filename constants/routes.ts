const ROUTES = {
    HOME: "/",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    PROFILE: (id: string) => `/profile/${id}`,
    TAG: (id: string) => `/tags/${id}`,
    ASK_QUESTION: "/ask-question",
    COLLECTION: "/collection",
    COMMUNITY: "/community",
    TAGS: "/tags",
    JOBS: "/jobs",
    SIGN_IN_WITH_OAUTH: "/signin-with-oauth",
    QUESTION: (id: string) => `/questions/${id}`,
}

export default ROUTES;