import React from "react"



const SubjectLink = ({ subject }) => {
    return(
        <div>
            <button className="color-white-subjects-in-course">{subject.name}</button>
        </div>
    );
};


export default SubjectLink;