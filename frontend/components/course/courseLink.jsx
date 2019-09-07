import {Link} from "react-router-dom";
import React from "react"


const CourseLink = ({course}) => (
    <div>
        <button>{course.name}</button>
    </div>   
);
export default CourseLink