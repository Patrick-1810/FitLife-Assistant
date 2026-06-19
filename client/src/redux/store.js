import { configureStore } from "@reduxjs/toolkit";
import loading from "./loading";
import history from "./history";
import messages from "./messages";

export const store = configureStore({
    reducer: {
        loading,
        history,
        messages
    }
})