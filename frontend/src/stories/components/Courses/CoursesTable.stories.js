import React from 'react';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import CoursesTable from "main/components/Course/CourseTable";
import { coursesFixtures } from 'fixtures/coursesFixtures';

export default {
    title: 'components/Courses/CoursesTable',
    component: CoursesTable
};

const Template = (args) => {
    return (
        <CourseTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    course: []
};

export const OneCourse = Template.bind({});

OneCourse.args = {
    course: coursesFixtures.oneCourse,
};

export const ThreeCourses = Template.bind({});
ThreeCourses.args = {
    course: coursesFixtures.threeCourses,
}