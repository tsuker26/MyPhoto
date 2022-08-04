import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {IUser} from "../../@types/types";
import {RootState} from "../store";
import axios from "../../utils/axios";

export enum Status {
    loading = 'loading',
    success = 'success',
    error = 'error',
}

interface IUserState {
    data: IUser,
    status: string | null,
    statusUpdate: string |null
}

const initialState: IUserState = {
    data: {_id: '', email: '', userName: '', token: '', userStatus: '', userAvatar: ''},
    status: null,
    statusUpdate: '',
}
type paramsType = {
    params: {
        userName: string;
        email?: string;
        password: string
    },
    auth: string

}


export const authUser = createAsyncThunk<IUser, paramsType>('auth/auth', async ({params, auth}) => {

    const {data} = await axios.post(auth, params)
    if (data.token) {
        window.localStorage.setItem('token', data.token)
    }
    return data

})

export const getMe = createAsyncThunk<IUser>('auth/getMe', async () => {
    const {data} = await axios.get('/user/me')
    return data
})
type update = {
    id: string,
    params: {
        userName?: string,
        userStatus?: string
    }

}
export const updateUserInfo = createAsyncThunk<IUser, update>('auth/updateInfo', async ({id, params}) => {
         const {data} = await axios.put(`user/update/${id}`, params)
         return data
})
type updateAvatarType = {
    id: string,
    userAvatar?:FormData | null
}


export const updateAvatar = createAsyncThunk<IUser,updateAvatarType>('auth/updateAvatar', async ({id, userAvatar}) => {

  if(userAvatar){
      const {data} = await axios.put(`user/update/${id}`, userAvatar,{
          headers:{
              'Content-type':'multipart/form-data'
          }
      })
      return data
  }else {
      const {data} = await axios.put(`user/update/${id}`, {userAvatar:''})
      return data
  }

})


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            window.localStorage.removeItem('token')
            state.data = {_id: '', email: '', userName: '', token: '', userStatus: '', userAvatar: '',}
            state.status = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(authUser.pending, (state) => {
            state.status = Status.loading
        })
        builder.addCase(authUser.fulfilled, (state: IUserState, action) => {
            state.data = action.payload
            state.status = Status.success
        })
        builder.addCase(authUser.rejected, (state ) => {
            state.status = Status.error;
        })
        builder.addCase(getMe.pending, (state) => {
            state.status = Status.loading
        })
        builder.addCase(getMe.fulfilled, (state: IUserState, action) => {
            state.data = action.payload
            state.status = Status.success
        })
        builder.addCase(getMe.rejected, (state) => {
            state.status = null;
        })
        builder.addCase(updateUserInfo.pending, (state) => {
            state.statusUpdate = Status.loading
        })
        builder.addCase(updateUserInfo.fulfilled, (state: IUserState, action) => {
            state.data.userName = action.payload?.userName
            state.data.userStatus = action.payload?.userStatus
            state.statusUpdate = Status.success

        })
        builder.addCase(updateUserInfo.rejected, (state) => {
            state.statusUpdate = Status.error;
        })
        builder.addCase(updateAvatar.pending, (state) => {
            state.statusUpdate = Status.loading
        })
        builder.addCase(updateAvatar.fulfilled, (state: IUserState, action) => {
            console.log(action.payload)
             state.data.userAvatar = action.payload?.userAvatar
            state.statusUpdate = Status.success

        })
        builder.addCase(updateAvatar.rejected, (state) => {
            state.statusUpdate =  Status.error;
        })


    }
})


export const authSelector = (state: RootState) => state.auth

export const isAuth = (state: RootState) => state.auth.data._id

export const {logout} = authSlice.actions

export default authSlice.reducer


