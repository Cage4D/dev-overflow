interface Tag {
  _id: string;
  name: string;
}

interface Author {
  _id: string;
  name: string;
  image: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
  createdAt: Date;
}

interface Metric {
  imgUrl: string;
  alt: string;
  title: string;
  value: string | number;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyles?: string;
}

interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string,
    email: string,
    image: string,
    username: string
  }
}

type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

interface CreateQuestionParams {
    title: string;
    content: string;
    tags: string[]
}

interface EditProfileParams {
  userId: string;
  name: string;
  username: string;
  bio?: string;
  image?: string;
  portfolio?: string;
}

interface UserParams {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  portfolio?: string;
}

interface UserIdParams {
  userId: string;
}

interface UserWithStats {
  _id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
  portfolio?: string;
  questions: number;
  answers: number;
  saves: number;
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };
type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>
}

interface GetQuestionParams {
  questionId: string;
}

interface CreateAnswerParams {
  questionId: string;
  content: string;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}

interface DeleteAnswerParams {
  answerId: string;
}

interface SaveQuestionParams {
  questionId: string;
}


interface ToggleVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

interface HasVotedParams {
  targetId: string;
  targetType: "question" | "answer";
}

interface VoteResponse {
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface Answer {
  _id: string;
  author: Author;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}
interface GetUserQuestionsParams extends PaginatedSearchParams {
  userId: string;
}

interface GetUserAnswersParams extends PaginatedSearchParams {
  userId: string;
}


interface IncrementViewsParams {
  questionId: string;
}