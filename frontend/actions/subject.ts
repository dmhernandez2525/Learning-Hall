import { Dispatch } from 'redux';
import type { Subject, AppThunk } from '../types';

// Declare jQuery global
declare const $: JQueryStatic;

// Action type constants
export const RECEIVE_ALL_SUBJECTS = "RECEIVE_ALL_SUBJECTS";
export const RECEIVE_SUBJECT = "RECEIVE_SUBJECT";
export const DELETE_SUBJECT = "DELETE_SUBJECT";

// Action interfaces
interface ReceiveAllSubjectsAction {
  type: typeof RECEIVE_ALL_SUBJECTS;
  subjects: Record<number, Subject>;
}

interface ReceiveSubjectAction {
  type: typeof RECEIVE_SUBJECT;
  subject: Subject;
}

interface DeleteSubjectAction {
  type: typeof DELETE_SUBJECT;
  subjectId: number;
}

export type SubjectActionTypes = ReceiveAllSubjectsAction | ReceiveSubjectAction | DeleteSubjectAction;

// API functions
const APIsubject = {
  allSubjects: (): JQuery.jqXHR<Record<number, Subject>> =>
    $.ajax({
      method: "GET",
      url: "/api/subjects"
    }),

  showSubject: (id: number): JQuery.jqXHR<{ subject: Subject }> =>
    $.ajax({
      method: "GET",
      url: `/api/subjects/${id}`
    }),

  newSubject: (subject: Partial<Subject> & { courseName?: string }): JQuery.jqXHR<Subject> =>
    $.ajax({
      method: "POST",
      url: "/api/subjects",
      data: { subject }
    }),

  updateSubject: (subject: Partial<Subject>): JQuery.jqXHR<Subject> =>
    $.ajax({
      method: "PATCH",
      url: `/api/subjects/${subject.id}`,
      data: { subject }
    }),

  deleteSubject: (id: number): JQuery.jqXHR<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/subjects/${id}`
    })
};

// Thunk action creators
export const allSubjects = (): AppThunk<Promise<ReceiveAllSubjectsAction>> =>
  (dispatch: Dispatch) =>
    APIsubject.allSubjects().then((subjects) =>
      dispatch({
        type: RECEIVE_ALL_SUBJECTS,
        subjects
      })
    );

export const showSubject = (id: number): AppThunk<Promise<ReceiveSubjectAction>> =>
  (dispatch: Dispatch) =>
    APIsubject.showSubject(id).then((response) =>
      dispatch({
        type: RECEIVE_SUBJECT,
        subject: response.subject || response
      })
    );

export const newSubject = (subject: Partial<Subject> & { courseName?: string }): AppThunk<Promise<ReceiveSubjectAction>> =>
  (dispatch: Dispatch) =>
    APIsubject.newSubject(subject).then((subject) =>
      dispatch({
        type: RECEIVE_SUBJECT,
        subject
      })
    );

export const updateSubject = (subject: Partial<Subject>): AppThunk<Promise<ReceiveSubjectAction>> =>
  (dispatch: Dispatch) =>
    APIsubject.updateSubject(subject).then((subject) =>
      dispatch({
        type: RECEIVE_SUBJECT,
        subject
      })
    );

export const deleteSubject = (id: number): AppThunk<Promise<DeleteSubjectAction>> =>
  (dispatch: Dispatch) =>
    APIsubject.deleteSubject(id).then((subjectId) =>
      dispatch({
        type: DELETE_SUBJECT,
        subjectId
      })
    );
