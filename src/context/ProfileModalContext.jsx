import { createContext, useContext, useState } from "react";

const ProfileModalContext = createContext(null);

export function ProfileModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <ProfileModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  return useContext(ProfileModalContext);
}
