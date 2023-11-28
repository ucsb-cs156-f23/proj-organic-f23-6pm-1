
import CoursesForm from 'main/components/Courses/CoursesForm';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function CoursesEditPage({storybook=false}) {
    let { id } = useParams();

    const { data: course, _error, _status } =
        useBackend(
            // Stryker disable next-line all : don't test internal caching of React Query
            [`/api/courses?id=${id}`],
            {  // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
                method: "GET",
                url: `/api/courses`,
                params: {
                    id
                }
            }
        );

    const objectToAxiosPutParams = (course) => ({
        url: "/api/courses/update",
        method: "PUT",
        params: {
            id: course.id,
        },
        data: {
            name: course.name,
            school: course.school,
            term: course.term,
            start: course.start,
            end: course.end,
            githubOrg: course.githubOrg
        }
    });

    const onSuccess = (course) => {
        toast(`Course updated - id: ${course.id} name: ${course.name} school: ${course.school} term: ${course.term} Start Date: ${course.start} End Date: ${course.end} GitHub organization: ${course.githubOrg}`);
    }

    const mutation = useBackendMutation(
        objectToAxiosPutParams,
        { onSuccess },
        // Stryker disable next-line all : hard to set up test for caching
        [`/api/courses?id=${id}`]
    );

    const { isSuccess } = mutation

    const onSubmit = async (data) => {
        mutation.mutate(data);
    }

    if (isSuccess && !storybook) {
        return <Navigate to="/courses" />
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Edit Course</h1>
                {
                    course && <CoursesForm initialContents={course} submitAction={onSubmit} buttonLabel={"Update"} />
                }
            </div>
        </BasicLayout>
    )

}