import { Dispatch } from 'redux';
import type { Course, AppThunk } from '../types';

// Declare jQuery global
declare const $: JQueryStatic;

// Action type constants
export const RECEIVE_ALL_COURSES = "RECEIVE_ALL_COURSES";
export const RECEIVE_COURSE = "RECEIVE_COURSE";
export const DELETE_COURSE = "DELETE_COURSE";

// Action interfaces
interface ReceiveAllCoursesAction {
  type: typeof RECEIVE_ALL_COURSES;
  courses: Record<number, Course>;
}

interface ReceiveCourseAction {
  type: typeof RECEIVE_COURSE;
  course: Course;
}

interface DeleteCourseAction {
  type: typeof DELETE_COURSE;
  courseId: number;
}

export type CourseActionTypes = ReceiveAllCoursesAction | ReceiveCourseAction | DeleteCourseAction;

// API functions
const APIcourse = {
  allCourses: (): JQuery.jqXHR<Record<number, Course>> =>
    $.ajax({
      method: "GET",
      url: "/api/courses"
    }),

  showCourse: (id: number): JQuery.jqXHR<Course> =>
    $.ajax({
      method: "GET",
      url: `/api/courses/${id}`
    }),

  newCourse: (course: Partial<Course>): JQuery.jqXHR<Course> =>
    $.ajax({
      method: "POST",
      url: "/api/courses",
      data: { course }
    }),

  updateCourse: (course: Partial<Course>): JQuery.jqXHR<Course> =>
    $.ajax({
      method: "PATCH",
      url: `/api/courses/${course.id}`,
      data: { course }
    }),

  deleteCourse: (id: number): JQuery.jqXHR<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/courses/${id}`
    })
};

// Thunk action creators
export const allCourses = (): AppThunk<Promise<ReceiveAllCoursesAction>> =>
  (dispatch: Dispatch) =>
    APIcourse.allCourses().then((courses) =>
      dispatch({
        type: RECEIVE_ALL_COURSES,
        courses
      })
    );

export const showCourse = (id: number): AppThunk<Promise<ReceiveCourseAction>> =>
  (dispatch: Dispatch) =>
    APIcourse.showCourse(id).then((course) =>
      dispatch({
        type: RECEIVE_COURSE,
        course
      })
    );

export const newCourse = (course: Partial<Course>): AppThunk<Promise<ReceiveCourseAction>> =>
  (dispatch: Dispatch) =>
    APIcourse.newCourse(course).then((course) =>
      dispatch({
        type: RECEIVE_COURSE,
        course
      })
    );

export const updateCourse = (course: Partial<Course>): AppThunk<Promise<ReceiveCourseAction>> =>
  (dispatch: Dispatch) =>
    APIcourse.updateCourse(course).then((course) =>
      dispatch({
        type: RECEIVE_COURSE,
        course
      })
    );

export const deleteCourse = (id: number): AppThunk<Promise<DeleteCourseAction>> =>
  (dispatch: Dispatch) =>
    APIcourse.deleteCourse(id).then((courseId) =>
      dispatch({
        type: DELETE_COURSE,
        courseId
      })
    );
