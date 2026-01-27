// User types
export interface User {
  id: number;
  username: string;
  email?: string;
  preferred_name?: string;
  pronunciation?: string;
  user_role?: string;
}

// Session types
export interface Session {
  currentUser: User | null;
  currentTask: string;
}

// Errors state
export interface ErrorsState {
  session: string[];
}

// Course types
export interface Course {
  id: number;
  name: string;
  author_id: number;
}

export interface CourseFormState {
  name: string;
  author_id: number;
  id: string;
  courseName: string;
  FormType: string;
}

export interface AllCourses {
  courses: Course[];
}

// Subject types
export interface Subject {
  id: number;
  name: string;
  courseId: number;
  authorId: number;
}

export interface SubjectFormState {
  name: string;
  authorId: number;
  courseName: string;
  subject: string;
  FormType: string;
}

export interface AllSubjects {
  subjescts: Subject[];  // Note: keeping typo for compatibility
}

// Task types
export interface Task {
  id: number;
  name: string;
  body: string;
  duration: number;
  completed: boolean;
  author_id: number;
  subject_id: number;
}

export interface TaskFormState {
  name: string;
  completed: boolean;
  duration: string;
  body: string;
  author_id: number;
  subject_id: string;
  subjectName: string;
  task: string;
  FormType: string;
}

export interface AllTasks {
  tasks: Task[];
}

// UI State types
export interface PainState {
  currentPain: string | number;
  currentCourse: Course | string;
}

export interface UIState {
  Pain: PainState;
}

// Entities state
export interface EntitiesState {
  courses: Record<number, Course>;
  subject: Record<number, Subject>;
  task: Record<number, Task>;
}

// Root Redux state
export interface RootState {
  session: Session;
  errors: ErrorsState;
  entities: EntitiesState;
  ui: UIState;
}

// Sign In form types
export interface SignInUser {
  username: string;
  password: string;
}

// Sign Up form types
export interface SignUpUser {
  username: string;
  email: string;
  password: string;
  preferred_name: string;
  pronunciation: string;
  user_role: string;
}

// Action types
export interface Action<T = unknown> {
  type: string;
  payload?: T;
}

// Redux action types
export const RECEIVE_ALL_COURSES = "RECEIVE_ALL_COURSES" as const;
export const RECEIVE_COURSE = "RECEIVE_COURSE" as const;
export const DELETE_COURSE = "DELETE_COURSE" as const;

export const RECEIVE_ALL_SUBJECTS = "RECEIVE_ALL_SUBJECTS" as const;
export const RECEIVE_SUBJECT = "RECEIVE_SUBJECT" as const;
export const DELETE_SUBJECT = "DELETE_SUBJECT" as const;

export const RECEIVE_ALL_TASKS = "RECEIVE_ALL_TASKS" as const;
export const RECEIVE_TASK = "RECEIVE_TASK" as const;
export const DELETE_TASK = "DELETE_TASK" as const;

export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER" as const;
export const LOGOUT_CURRENT_USER = "LOGOUT_CURRENT_USER" as const;
export const RECEIVE_SESSION_ERRORS = "RECEIVE_SESSION_ERRORS" as const;
export const CLEAR_SESSION_ERRORS = "CLEAR_SESSION_ERRORS" as const;
export const NEW_TASK = "NEW_TASK" as const;

export const RECEIVE_PAIN = "RECEIVE_PAIN" as const;
export const NEW_COURSE = "NEW_COURSE" as const;

// Course Actions
export interface ReceiveAllCoursesAction {
  type: typeof RECEIVE_ALL_COURSES;
  courses: Record<number, Course>;
}

export interface ReceiveCourseAction {
  type: typeof RECEIVE_COURSE;
  course: Course;
}

export interface DeleteCourseAction {
  type: typeof DELETE_COURSE;
  courseId: number;
}

export type CourseAction = ReceiveAllCoursesAction | ReceiveCourseAction | DeleteCourseAction;

// Subject Actions
export interface ReceiveAllSubjectsAction {
  type: typeof RECEIVE_ALL_SUBJECTS;
  subjects: Record<number, Subject>;
}

export interface ReceiveSubjectAction {
  type: typeof RECEIVE_SUBJECT;
  subject: Subject;
}

export interface DeleteSubjectAction {
  type: typeof DELETE_SUBJECT;
  subjectId: number;
}

export type SubjectAction = ReceiveAllSubjectsAction | ReceiveSubjectAction | DeleteSubjectAction;

// Task Actions
export interface ReceiveAllTasksAction {
  type: typeof RECEIVE_ALL_TASKS;
  tasks: Record<number, Task>;
}

export interface ReceiveTaskAction {
  type: typeof RECEIVE_TASK;
  task: Task;
}

export interface DeleteTaskAction {
  type: typeof DELETE_TASK;
  taskId: number;
}

export type TaskAction = ReceiveAllTasksAction | ReceiveTaskAction | DeleteTaskAction;

// Session Actions
export interface ReceiveCurrentUserAction {
  type: typeof RECEIVE_CURRENT_USER;
  user: User;
}

export interface LogoutCurrentUserAction {
  type: typeof LOGOUT_CURRENT_USER;
  userId: number;
}

export interface ReceiveSessionErrorsAction {
  type: typeof RECEIVE_SESSION_ERRORS;
  errors: string[];
}

export interface ClearSessionErrorsAction {
  type: typeof CLEAR_SESSION_ERRORS;
}

export interface NewTaskAction {
  type: typeof NEW_TASK;
  task: string;
}

export type SessionAction =
  | ReceiveCurrentUserAction
  | LogoutCurrentUserAction
  | ReceiveSessionErrorsAction
  | ClearSessionErrorsAction
  | NewTaskAction;

// UI Actions
export interface ReceivePainAction {
  type: typeof RECEIVE_PAIN;
  id: number | string;
}

export interface NewCourseAction {
  type: typeof NEW_COURSE;
  CurrentCourse: Course;
}

export type UIAction = ReceivePainAction | NewCourseAction;

// Combined action type
export type AppAction = CourseAction | SubjectAction | TaskAction | SessionAction | UIAction;

// Thunk types
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// API Response types
export interface ApiError {
  responseJSON?: string[];
}

// Window extensions for global assets
declare global {
  interface Window {
    logoUrl?: string;
    img1Url?: string;
    img2Url?: string;
    img3Url?: string;
    slack?: string;
    handgerUrl?: string;
    currentUser?: User;
  }
}
