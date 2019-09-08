import React from "react"



const SubjectLink = ({ subject }) => {
    return(
        <div>
            <button>{subject.name}</button>
        </div>
    );
};


export default SubjectLink;