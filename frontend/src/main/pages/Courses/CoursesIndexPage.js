
import { useBackend } from 'main/utils/useBackend';

import CoursesTable from 'main/components/Courses/CoursesTable';
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
//import { hasRole, useCurrentUser } from 'main/utils/currentUser';
import { useCurrentUser } from 'main/utils/currentUser';
import { Button } from 'react-bootstrap';

export default function CoursesIndexPage() {

    const currentUser = useCurrentUser();

    const { data: courses, error: _error, status: _status } =
        useBackend(
            // Stryker disable next-line all : don't test internal caching of React Query
            ["/api/courses/all"],
            { method: "GET", url: "/api/courses/all" },
            // Stryker disable next-line all : don't test default value of empty list
            []
        );

    const createButton = () => {
        //if (hasRole(currentUser, "ROLE_ADMIN")) {
            return (
                <Button
                    variant="primary"
                    href="/courses/create"
                    style={{ float: "right" }}
                >
                    Create New Course
                </Button>
            )
        //} 
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                {createButton()}
                <h1>Courses</h1>
                <CoursesTable courses={courses} currentUser={currentUser} />
            </div>
        </BasicLayout>
    );
}