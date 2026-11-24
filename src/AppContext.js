import { createContext, useContext } from "react";

/* Những thứ mọi trang cần: danh sách món đã thuộc, mở chat, báo toast, phóng to ảnh. */
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
