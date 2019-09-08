export const newSubject = (subject) => {
    return (
        $.ajax({
            method: "POST",
            url: "/api/subjects",
            data: {
                subject
            }
        })
    )
};


export const allSubjects = () => {
    return (
        $.ajax({
            method: "GET",
            url: "/api/subjects"
        })
    )
};



export const showSubject = (id) => {
    return (
        $.ajax({
            method: "GET",
            url: `/api/subjects/${id}`
        })
    )
};




export const updateSubject = (subject) => {
    return (
        $.ajax({
            method: "Patch",
            url: `/api/subjects/${subject.id}`,
            data: {
                subject
            }
        })
    )
};


export const deleteSubject = (id) => {
    return (
        $.ajax({
            method: "DELETE",
            url: `/api/subjects/${id}`
        })
    )
};
