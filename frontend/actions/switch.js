export const RECEIVE_PAIN = "RECEIVE_PAIN";
export const NEW_COURSE = "NEW_COURSE";

export const updatePain = (id) => {
    return ({
        type: RECEIVE_PAIN,
        id
    })
}

export const receiveCourse = (CurrentCourse) => {
    return ({
        type: NEW_COURSE,
        CurrentCourse
    })
}