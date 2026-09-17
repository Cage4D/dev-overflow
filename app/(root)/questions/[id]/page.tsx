export default async function QuestionDetails({ params }: RouteParams) {
    const { id } = await params;
    return (
        <div>
            Question page: { id }
        </div>
    );
};