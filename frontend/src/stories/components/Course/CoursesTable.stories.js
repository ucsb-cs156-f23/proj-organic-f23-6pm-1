import React from 'react';
import { courseFixture } from "fixtures/courseFixture";
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import CourseTable from "main/components/Course/CourseTable";

export default {
    title: 'components/Course/CourseTable',
    component: CourseTable
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
    course: courseFixture.oneCourse,
};

export const ThreeCourses = Template.bind({});
ThreeCourses.args = {
    course: courseFixture.threeCourses,
}