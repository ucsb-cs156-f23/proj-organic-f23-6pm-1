import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import CoursesCreatePage from "main/pages/Courses/CoursesCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("CourseCreatePage tests", () => {

    const axiosMock =new AxiosMockAdapter(axios);

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    test("renders without crashing", () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("when you fill in the form and hit submit, it makes a request to the backend", async () => {

        const queryClient = new QueryClient();
        const course = {
            id: 1,
            name: "CS156",
            school: "UCSB",
            term: "F23",
            startDate: "2023-09-24T12:00:00",
            endDate: "2023-12-15T12:00:00",
            githubOrg: "ucsb-cs156-f23"
        };

        axiosMock.onPost("/api/courses/post").reply( 202, course );

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CoursesCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("CoursesForm-name")).toBeInTheDocument();
        });

        const nameField = screen.getByTestId("CoursesForm-name");
        const schoolField = screen.getByTestId("CoursesForm-school");
        const termField = screen.getByTestId("CoursesForm-term");
        const startField = screen.getByTestId("CoursesForm-startDate");
        const endField = screen.getByTestId("CoursesForm-endDate");
        const githubOrgField = screen.getByTestId("CoursesForm-githubOrg");
        const submitButton = screen.getByTestId("CoursesForm-submit");

        fireEvent.change(nameField, { target: { value: 'CS156' } });
        fireEvent.change(schoolField, { target: { value: 'UCSB' } });
        fireEvent.change(termField, { target: { value: 'F23' } });
        fireEvent.change(startField, { target: { value: '2023-09-24T12:00:00' } });
        fireEvent.change(endField, { target: { value: '2023-12-15T12:00:00' } });
        fireEvent.change(githubOrgField, { target: { value: 'ucsb-cs156-f23' } });

        expect(submitButton).toBeInTheDocument();

        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual(
            {
                "name": "CS156",
                "school": "UCSB",
                "term": "F23",
                "startDate": "2023-09-24T12:00",
                "endDate": "2023-12-15T12:00",
                "githubOrg": "ucsb-cs156-f23"
        });

        expect(mockToast).toBeCalledWith("New course created - id: 1");
        expect(mockNavigate).toBeCalledWith({ "to": "/courses" });
    });


});


