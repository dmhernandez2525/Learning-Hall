export const RECEIVE_PAIN = "RECEIVE_PAIN";

export const updatePain = (id) => {
    return ({
        type: RECEIVE_PAIN,
        id
    })
}