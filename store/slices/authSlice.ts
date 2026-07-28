// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// interface User {
//   id: number;
//   username: string;
//   role: string;
//   rightsLevel: string;
//   collegeId: number;
//   applicationName: string;
//   collegeName: string;
// }

// interface AuthState {
//   loading: boolean;
//   user: User | null;
//   token: string | null;
//   error: string | null;
// }

// const initialState: AuthState = {
//   loading: false,
//   user: null,
//   token: null,
//   error: null,
// };

// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async (
//     data: {
//       name: string;
//       password: string;
//       level: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await reduxApiClient.post("auth/login", data);


//       if (!response.success) {
//         return rejectWithValue(response.error?.message);
//       }

//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.message || "Something went wrong");
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.error = null;

//       localStorage.removeItem("token");
//       localStorage.removeItem("refreshToken");
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//     .addCase(loginUser.fulfilled, (state, action: any) => {
//   console.log("Payload:", action.payload);
//   console.log("Token:", action.payload.token);
//   console.log("User:", action.payload.user);

//   state.loading = false;
//   state.user = action.payload.user;
//   state.token = action.payload.token;

//   localStorage.setItem("token", action.payload.token);

//   if (action.payload.refreshToken) {
//     localStorage.setItem("refreshToken", action.payload.refreshToken);
//   }
// })
//       .addCase(loginUser.rejected, (state, action: any) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { logout } = authSlice.actions;

// export default authSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";
import { setStorage } from "@/utils/storage";

interface User {
  id: number | null;
  username: string;
  role: string;
  rightsLevel: string;
  collegeId: string;
  applicationName: string;
  collegeName: string;
}

interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  token: null,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    data: {
      name: string;
      password: string;
      level: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reduxApiClient.post("auth/login", data);

      if (!response.success) {
        return rejectWithValue(
          response.error?.message || "Login failed"
        );
      }

      // Your backend returns:
      // {
      //   success: true,
      //   message: "...",
      //   data: {
      //      token: "...",
      //      user: {...}
      //   }
      // }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Something went wrong"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.error = null;

        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);

        setStorage("userid", action.payload.user.username);
        setStorage("role", action.payload.user.role);

        console.log("Token:", action.payload.token);
      })

      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;