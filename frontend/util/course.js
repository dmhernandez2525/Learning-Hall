export const  newCourse = (course) => {
    return(
        $.ajax({
            method: "POST",
            url: "/api/courses",
            data: {course}
        })
    )
}