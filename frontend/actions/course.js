import * as APIcourse from "../util/course"

export const RECEIVE_ALL_COURSES = "RECEIVE_ALL_COURSES";
export const RECEIVE_COURSE = "RECEIVE_COURSE";
export const DELETE_COURSE = "DELETE_COURSE";


export const allCourses = () => (dispatch) => (
    APIcourse.allCourses().then(courses => dispatch({
        type: RECEIVE_ALL_COURSES,
        courses
    }))
);


export const showCourse = (id) => (dispatch) => (
    APIcourse.showCourse(id).then(course => dispatch({
        type: RECEIVE_COURSE,
        course
    }))
);


export const newCourse = (course) => (dispatch) => (
    APIcourse.newCourse(course).then(course => dispatch({
        type: RECEIVE_COURSE,
        course
    }))
);


export const updateCourse = (course) => (dispatch) => (
    APIcourse.updateCourse(course).then(course => dispatch({
        type: RECEIVE_COURSE,
        course
    }))
);


export const deleteCourse = (id) => (dispatch) => (
    APIcourse.deleteCourse(id).then(courseId => dispatch({
        type: DELETE_COURSE,
        courseId
    }))
);
