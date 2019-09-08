import * as APIsubject from "../util/subject"
export const RECEIVE_ALL_SUBJECTS = "RECEIVE_ALL_SUBJECTS";
export const RECEIVE_SUBJECT = "RECEIVE_SUBJECT";
export const DELETE_SUBJECT = "DELETE_SUBJECT";


export const allSubjects = () => dispatch => (
    APIsubject.allSubjects().then(subjects => dispatch({
        type: RECEIVE_ALL_SUBJECTS,
        subjects
    }))
);
        
        
export const newSubject = (subject) => dispatch => (
    APIsubject.newSubject(subject).then(subject => dispatch({
        type: RECEIVE_SUBJECT,
        subject
    }))
);


export const showSubject = (id) => dispatch => (
    APIsubject.showSubject(id).then(subject => dispatch({
        type: RECEIVE_SUBJECT,
        subject
    }))
);


export const updateSubject = (subject) => dispatch => (
    APIsubject.updateSubject(subject).then(subject => dispatch({
        type: RECEIVE_SUBJECT,
        subject
    }))
);


export const deleteSubject = (id) => dispatch => (
    APIsubject.deleteSubject(id).then(subjectId => dispatch({
        type: DELETE_SUBJECT,
        subjectId
    }))
);
