import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { formatTime } from "main/utils/dateUtils";
import { useBackendMutation } from "main/utils/useBackend";

export default function UsersTable({ users, showToggleButtons = false }) {
    //toggleAdmin
    function cellToAxiosParamsToggleAdmin(cell) {
        return {
            url: "/api/admin/users/toggleAdmin",
            method: "POST",
            params: {
                id: cell.row.values.githubId
            }
        }
    }

    // Stryker disable all : hard to test for query caching
    const toggleAdminMutation = useBackendMutation(
        cellToAxiosParamsToggleAdmin,
        {onSuccess: () => {
            window.location.reload();
        }},
        ["/api/admin/users"]
    );
    // Stryker enable all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const toggleAdminCallback = async (cell) => { toggleAdminMutation.mutate(cell); }
    
    //toggleAdmin
    function cellToAxiosParamsToggleInstructor(cell) {
        return {
            url: "/api/admin/users/toggleInstructor",
            method: "POST",
            params: {
                id: cell.row.values.githubId
            }
        }
    }

    // Stryker disable all : hard to test for query caching
    const toggleInstructorMutation = useBackendMutation(
        cellToAxiosParamsToggleInstructor,
        {onSuccess: () => {
            window.location.reload();
        }},
        ["/api/admin/users"]
    );
    // Stryker enable all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const toggleInstructorCallback = async (cell) => { toggleInstructorMutation.mutate(cell); }

    const columns = [
        {
            Header: 'githubId',
            accessor: 'githubId', // accessor is the "key" in the data
        },
        {
            Header: 'githubLogin',
            accessor: 'githubLogin', // accessor is the "key" in the data
        },
        {
            Header: 'fullName',
            accessor: 'fullName',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Last Online',
            id: 'lastOnline',
            accessor: (row) => formatTime(row.lastOnline),
        },
        {
            Header: 'Admin',
            id: 'admin',
            accessor: (row, _rowIndex) => String(row.admin) // hack needed for boolean values to show up
        },
        {
            Header: 'Instructor',
            id: 'instructor',
            accessor: (row, _rowIndex) => String(row.instructor)
        }
    ];

    const buttonColumn = [
        ...columns,
        ButtonColumn("toggle-admin", "primary", toggleAdminCallback, "UsersTable"),
        ButtonColumn("toggle-instructor", "primary", toggleInstructorCallback, "UsersTable")
    ];

    return <OurTable
        data={users}
        columns={showToggleButtons ? buttonColumn : columns}
        testid={"UsersTable"} />;
};