import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes";
import HomeFilter from "@/components/filters/HomeFilter"
import Link from "next/link"
import QuestionCard from "@/components/cards/QuestionCard";

interface SearchParams {
    searchParams: Promise<{[key: string]: string}>
}

const questions = [
    { 
      _id: "1", 
      title: "How to learn Next.js?", 
      description: "I want to learn Next.js, Can anyone help me?", 
      tags: [
        { _id: "1", name: "React" },
        { _id: "2", name: "Javascript" },
        { _id: "3", name: "Next.js" },
      ],
      author: { _id: "1", name: "John Doe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpbpIzZLZdUlCw0WgKIJlev-hGqdI8pglWeyYtGOzEg&s=10" },
      upvotes: 10,
      answers: 5,
      views: 100,
      createdAt: new Date(),
    },
    { 
      _id: "2", 
      title: "How to learn Javascript?", 
      description: "I want to learn Next.js, Can anyone help me?", 
      tags: [
        { _id: "1", name: "React" },
        { _id: "2", name: "Javascript" },
        { _id: "3", name: "Next.js" },
      ],
      author: { _id: "1", name: "Lisa Ann", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLzyK1ng-s8JsFOEjX6hkOSFOodiTNqa24bp3TZJ2c5Q&s=10" },
      upvotes: 10,
      answers: 5,
      views: 100,
      createdAt: new Date(),
    },
]

export default async function Home({ searchParams }: SearchParams ) {
    const { query = "", filter = "" } = await searchParams;
    const filteredQuestions = questions.filter(question => (
        question.title.toLowerCase().includes(query?.toLowerCase())
    ))
    return (
        <>
            <section className="flex w-full flex-col-reverse sm:flex-row justify-between gap-4 sm:items-center">
                <h1 className="h1-bold text-dark100_light900">All Questions</h1>
                <Button 
                  className="primary-gradient min-h-11.5 px-4 py-3 text-light-900!"
                  render={<Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>}
                  nativeButton={false}
                />
            </section>
            <section className="mt-11">
                <LocalSearch
                route="/"
                imgSrc="/icons/search.svg"
                placeholder="Search Questions..."
                otherClasses="flex-1"/>
            </section>
            <HomeFilter/>
            <div className="mt-10 flex w-full flex-col gap-6">
                {filteredQuestions.map(question => (
                    <QuestionCard key={question._id} question={question}/> 
                ))}
            </div>
        </>
    );
};