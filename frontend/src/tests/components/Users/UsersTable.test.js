import { render, screen } from "@testing-library/react";
import UsersTable from "main/components/Users/UsersTable";
import prim from "main/components/Users/UsersTable.js"
import { formatTime } from "main/utils/dateUtils";
import usersFixtures from "fixtures/usersFixtures";
import { QueryClient, QueryClientProvider } from 'react-query';

describe("UserTable tests", () => {
    const queryClient = new QueryClient();
    test("renders without crashing for empty table", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UsersTable users={[]} />
            </QueryClientProvider>
        );
    });

    test("renders without crashing for three users", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UsersTable users={usersFixtures.threeUsers} />
            </QueryClientProvider>
        );
    });

    test("Has the expected column headers and content", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UsersTable users={usersFixtures.threeUsers}/>
            </QueryClientProvider>
        );
    
        const expectedHeaders = ["githubId", "githubLogin", "fullName", "Email", "Last Online", "Admin", "Instructor"];
        const expectedFields = ["githubId", "githubLogin", "fullName", "email", "lastOnline", "admin", "instructor"];
        const testId = "UsersTable";

        expectedHeaders.forEach( (headerText)=> {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach( (field)=> {
          const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
          expect(header).toBeInTheDocument();   
        });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-githubId`)).toHaveTextContent("11111");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-fullName`)).toHaveTextContent("Phill Conrad");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
        expect(screen.getByTestId(`${testId}-cell-row-0-col-instructor`)).toHaveTextContent("false");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-githubLogin`)).toHaveTextContent("cgaucho");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    });

    test("Has the expected column headers and content for admin view", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UsersTable users={usersFixtures.threeUsers} showToggleButtons={true}/>
            </QueryClientProvider>
        );
    
        const expectedHeaders = ["githubId", "githubLogin", "fullName", "Email", "Last Online", "Admin", "Instructor"];
        const expectedFields = ["githubId", "githubLogin", "fullName", "email", "lastOnline", "admin", "instructor", "toggle-admin-button", "toggle-instructor-button"];
        const testId = "UsersTable";

        expectedHeaders.forEach( (headerText)=> {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach( (field)=> {
          const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
          expect(header).toBeInTheDocument();   
        });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-githubId`)).toHaveTextContent("11111");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-fullName`)).toHaveTextContent("Phill Conrad");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
        expect(screen.getByTestId(`${testId}-cell-row-0-col-instructor`)).toHaveTextContent("false");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-toggle-admin-button`)).toHaveTextContent("toggle-admin");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-toggle-admin-button`)).toHaveClass("btn-primary");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-toggle-instructor-button`)).toHaveTextContent("toggle-instructor");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-toggle-instructor-button`)).toHaveClass("btn-primary");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-githubLogin`)).toHaveTextContent("cgaucho");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    });
    
});
