export const thunk = (store) => (next) => (action) =>{
    if (action instanceof "function") {
        return action(store.dispatch)
    } else {
        return next(action)
    }
}