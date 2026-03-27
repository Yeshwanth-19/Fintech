import * as React from "react";

export type Role = "admin" | "corporate";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = React.createContext<RoleContextValue>({
  role: "admin",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(() => {
    try {
      const saved = localStorage.getItem("gfolio_role");
      return (saved === "corporate" ? "corporate" : "admin") as Role;
    } catch {
      return "admin";
    }
  });

  const setRole = (r: Role) => {
    setRoleState(r);
    try { localStorage.setItem("gfolio_role", r); } catch {}
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return React.useContext(RoleContext);
}
