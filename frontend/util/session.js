const signUp = (user) => {
    return (
        $.ajax({
            method: "POST",
            url: "/api/users",
            data: {user}
        })
    )
}

const logIn = (user) => {
    return(
        $.ajax({
            method: "POST",
            url: "/api/sessions",
            data: {user}
        })
    )
}

const signOut = () => {
    return(
        $.ajax({
            method: "DELETE",
            url: "/api/sessions"
        })
    )
}