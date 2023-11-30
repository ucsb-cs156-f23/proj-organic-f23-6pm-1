import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import CoursesForm from "main/components/Courses/CoursesForm";
import { coursesFixtures } from "fixtures/coursesFixtures";
import { BrowserRouter as Router } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));


describe("CoursesForm tests", () => {

    test("renders correctly", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByText(/Name/);
        await screen.findByText(/Create/);
    });


    test("renders correctly when passing in a Course", async () => {

        render(
            <Router  >
                <CoursesForm initialContents={coursesFixtures.oneCourse} />
            </Router>
        );
        await screen.findByTestId(/CoursesForm-id/);
        expect(screen.getByText(/Id/)).toBeInTheDocument();
        expect(screen.getByTestId(/CoursesForm-id/)).toHaveValue("1");
    });


    test("Correct Error messsages on bad input", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByTestId("CoursesForm-startDate");
        const startField = screen.getByTestId("CoursesForm-startDate");
        const submitButton = screen.getByTestId("CoursesForm-submit");

        fireEvent.change(startField, { target: { value: 'bad-input' } });
        fireEvent.click(submitButton);
    });

    test("Correct Error messsages on missing input", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByTestId("CoursesForm-submit");
        const submitButton = screen.getByTestId("CoursesForm-submit");

        fireEvent.click(submitButton);

        await screen.findByText(/Name is required./);
        expect(screen.getByText(/School is required./)).toBeInTheDocument();
        expect(screen.getByText(/Term is required./)).toBeInTheDocument();
        expect(screen.getByText(/StartDate is required./)).toBeInTheDocument();
        expect(screen.getByText(/EndDate is required./)).toBeInTheDocument();
        expect(screen.getByText(/GithubOrg is required./)).toBeInTheDocument();
    });

    test("No Error messsages on good input", async () => {

        const mockSubmitAction = jest.fn();


        render(
            <Router  >
                <CoursesForm submitAction={mockSubmitAction} />
            </Router>
        );
        await screen.findByTestId("CoursesForm-name");

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
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {

        render(
            <Router  >
                <CoursesForm />
            </Router>
        );
        await screen.findByTestId("CoursesForm-cancel");
        const cancelButton = screen.getByTestId("CoursesForm-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));

    });

});


