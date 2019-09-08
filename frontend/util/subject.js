export const newSubject = (subject) => (
    $.ajax({
        method: "POST",
        url: "/api/subjects",
        data: {subject}
    })
)