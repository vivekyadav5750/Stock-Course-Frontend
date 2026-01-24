import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./slice/user";
import { courseReducer } from "./slice/course";
import { moduleReducer } from "./slice/module";
import { lessonReducer } from "./slice/lesson";
import { transactionReducer } from "./slice/transaction";

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    module: moduleReducer,
    lesson: lessonReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;