import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setAccessToken, setUserData } from '../../features/authentication/userDataSlice'


const baseQuery = fetchBaseQuery({
    // it is the url for the backend
    baseUrl: import.meta.env.VITE_BACKEND_URL + "/api/v1",
    // credentials: "include" means we want to send cookies
    credentials: "include",
    // here headers is being set
    prepareHeaders: (headers, { getState }) => {
        // getting the token from the auth state
        const token = getState().userData.accessToken
        // if there is token then set the token in the header
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    console.log("got error", result?.error?.data.data.statusCode);
    if (result?.error?.data.data.statusCode === 401) {
        console.log("Sending refresh token");
        // send refresh token to get new accessToken
        const refreshResult = await baseQuery("/users/refreshToken", api, extraOptions)
        console.log(refreshResult)
        // refreshResult?.data will return only accessToken according to the code written here
        if (refreshResult?.data) {
            const user = api.getState().userData.userData
            // store the new token received
            console.log("token", refreshResult?.data.data.accessToken);
            api.dispatch(setAccessToken(refreshResult?.data.data.accessToken))
            api.dispatch(setUserData(user))

            // retry the original query with new accessToken
            result = await baseQuery(args, api, extraOptions)
        }
    }
    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({})
})

