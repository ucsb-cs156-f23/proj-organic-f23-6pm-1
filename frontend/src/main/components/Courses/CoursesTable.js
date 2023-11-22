import React from "react";
import OurTable from "main/components/OurTable"

const columns = [
    {
        Header: 'id',
        accessor: 'id', // accessor is the "key" in the data
    },
    {
        Header: 'Course Name',
        accessor: 'name',
    },
    {
        Header: 'School',
        accessor: 'school',
    },
    {
        Header: 'Term',
        accessor: 'term',
    },
    {
        Header: 'Start Date',
        accessor: 'start',
    },
    {
        Header: 'End Date',
        accessor: 'end',
    },
    {
        Header: 'GitHub Org',
        accessor: 'ghOrg',
    },
];

export default function CoursesTable({ courses }) {
    return <OurTable
        data={courses}
        columns={columns}
        testid={"coursesTable"} />;
};