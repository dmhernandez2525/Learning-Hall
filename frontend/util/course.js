export const  allCourses = () => {
    return(
        $.ajax({
            method: "GET",
            url: "/api/courses"
        })
    );
};


export const  showCourse = (id) => {
    return(
        $.ajax({
            method: "GET",
            url: `/api/courses/${id}`
        })
    );
};

export const  newCourse = (course) => {
    return(
        $.ajax({
            method: "POST",
            url: "/api/courses",
            data: {course}
        })
    );
};

export const updateCourse = (course) => {
    return(
        $.ajax({
            method: "Patch",
            url: `/api/courses/${course.id}`,
            data: {course}
        })
    );
};

export const deleteCourse = (id) => {
    return(
        $.ajax({
            method: "DELETE",
            url: `/api/courses/${id}`
        })
    );
};
