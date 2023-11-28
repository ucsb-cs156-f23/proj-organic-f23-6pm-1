import { waitFor, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import AdminUsersPage from "main/pages/AdminUsersPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";

describe("AdminUsersPage tests",  () => {
    beforeEach(() => {
        // Mock window.location.reload
        const { location } = window;
        delete global.window.location;
        global.window.location = { ...location, reload: jest.fn() };
    });
    const queryClient = new QueryClient();

    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(()=>{
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);
        axiosMock.onPost("/api/admin/users/toggleAdmin").reply(200);
        axiosMock.onPost("/api/admin/users/toggleInstructor").reply(200);
    });

    test("renders without crashing on three users", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminUsersPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        const testId = "UsersTable";
        expect(await screen.findByText("Users")).toBeInTheDocument();
        expect(screen.getByTestId(`${testId}-cell-row-0-col-githubLogin`)).toHaveTextContent("pconrad");
        expect(await screen.getByTestId(`${testId}-cell-row-0-col-toggle-admin-button`)).toHaveTextContent("toggle-admin");
        expect(await screen.getByTestId(`${testId}-cell-row-0-col-toggle-instructor-button`)).toHaveTextContent("toggle-instructor");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-instructor`)).toHaveTextContent("true");
    });

    test("toggle buttons trigger requests for three users", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminUsersPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        const testId = "UsersTable";

        const secondRowAdminButton = await screen.getByTestId(`${testId}-cell-row-1-col-toggle-admin-button`);
        expect(secondRowAdminButton).toHaveTextContent("toggle-admin");
        fireEvent.click(secondRowAdminButton);

        await waitFor(() => {
            expect(axiosMock.history.post).toHaveLength(1);
            expect(axiosMock.history.post[0].url).toBe("/api/admin/users/toggleAdmin");
        });

        const secondRowInstructorButton = await screen.getByTestId(`${testId}-cell-row-1-col-toggle-instructor-button`);
        expect(secondRowInstructorButton).toHaveTextContent("toggle-instructor");
        fireEvent.click(secondRowInstructorButton);

        await waitFor(() => {
            expect(axiosMock.history.post).toHaveLength(2);
            expect(axiosMock.history.post[0].params.id).toBe(usersFixtures.threeUsers[1].githubId);
        });
    });
});
