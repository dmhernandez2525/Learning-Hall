
export const signUp = (user) => {
    return (
        $.ajax({
            method: "POST",
            url: "/api/users",
            data: {user}
        })
    )
}

export const logIn = (user) => {
    return(
        $.ajax({
            method: "POST",
            url: "/api/sessions",
            data: {user}
        })
    )
}

export const signOut = () => {
    return(
        $.ajax({
            method: "DELETE",
            url: "/api/sessions"
        })
    )
}