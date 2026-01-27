/**
 * API utilities for making HTTP requests
 * Provides type-safe API calls with error handling
 */

import type {
  Course,
  Subject,
  Task,
  User,
  SignInUser,
  SignUpUser
} from '../types';

// Type for jQuery AJAX response
type AjaxPromise<T> = JQuery.jqXHR<T>;

// Declare jQuery global (provided by Rails)
declare const $: JQueryStatic;

/**
 * API endpoints for courses
 */
export const CourseAPI = {
  getAll: (): AjaxPromise<Record<number, Course>> =>
    $.ajax({
      method: "GET",
      url: "/api/courses"
    }),

  getOne: (id: number): AjaxPromise<Course> =>
    $.ajax({
      method: "GET",
      url: `/api/courses/${id}`
    }),

  create: (course: Partial<Course>): AjaxPromise<Course> =>
    $.ajax({
      method: "POST",
      url: "/api/courses",
      data: { course }
    }),

  update: (course: Partial<Course>): AjaxPromise<Course> =>
    $.ajax({
      method: "PATCH",
      url: `/api/courses/${course.id}`,
      data: { course }
    }),

  delete: (id: number): AjaxPromise<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/courses/${id}`
    })
};

/**
 * API endpoints for subjects
 */
export const SubjectAPI = {
  getAll: (): AjaxPromise<Record<number, Subject>> =>
    $.ajax({
      method: "GET",
      url: "/api/subjects"
    }),

  getOne: (id: number): AjaxPromise<{ subject: Subject }> =>
    $.ajax({
      method: "GET",
      url: `/api/subjects/${id}`
    }),

  create: (subject: Partial<Subject>): AjaxPromise<Subject> =>
    $.ajax({
      method: "POST",
      url: "/api/subjects",
      data: { subject }
    }),

  update: (subject: Partial<Subject>): AjaxPromise<Subject> =>
    $.ajax({
      method: "PATCH",
      url: `/api/subjects/${subject.id}`,
      data: { subject }
    }),

  delete: (id: number): AjaxPromise<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/subjects/${id}`
    })
};

/**
 * API endpoints for tasks
 */
export const TaskAPI = {
  getAll: (): AjaxPromise<Record<number, Task>> =>
    $.ajax({
      method: "GET",
      url: "/api/tasks"
    }),

  getOne: (id: number): AjaxPromise<Task> =>
    $.ajax({
      method: "GET",
      url: `/api/tasks/${id}`
    }),

  create: (task: Partial<Task>): AjaxPromise<Task> =>
    $.ajax({
      method: "POST",
      url: "/api/tasks",
      data: { task }
    }),

  update: (task: Partial<Task>): AjaxPromise<Task> =>
    $.ajax({
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      data: { task }
    }),

  delete: (id: number): AjaxPromise<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/tasks/${id}`
    })
};

/**
 * API endpoints for session/authentication
 */
export const SessionAPI = {
  signUp: (user: SignUpUser): AjaxPromise<User> =>
    $.ajax({
      method: "POST",
      url: "/api/users",
      data: { user }
    }),

  logIn: (user: SignInUser): AjaxPromise<User> =>
    $.ajax({
      method: "POST",
      url: "/api/sessions",
      data: { user }
    }),

  signOut: (): AjaxPromise<number> =>
    $.ajax({
      method: "DELETE",
      url: "/api/sessions"
    })
};

// Re-export legacy functions for backward compatibility
export const allCourses = CourseAPI.getAll;
export const showCourse = CourseAPI.getOne;
export const newCourse = CourseAPI.create;
export const updateCourse = CourseAPI.update;
export const deleteCourse = CourseAPI.delete;

export const allSubjects = SubjectAPI.getAll;
export const showSubject = SubjectAPI.getOne;
export const newSubject = SubjectAPI.create;
export const updateSubject = SubjectAPI.update;
export const deleteSubject = SubjectAPI.delete;

export const allTasks = TaskAPI.getAll;
export const showTask = TaskAPI.getOne;
export const newTask = TaskAPI.create;
export const updateTask = TaskAPI.update;
export const deleteTask = TaskAPI.delete;

export const signUp = SessionAPI.signUp;
export const logIn = SessionAPI.logIn;
export const signOut = SessionAPI.signOut;
