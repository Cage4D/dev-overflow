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
    tags: Tag[];
    author: Author;
    upvotes: number;
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
}