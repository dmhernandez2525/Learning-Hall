// User types
export interface User {
  id: number;
  username: string;
  email?: string;
  preferred_name?: string;
  pronunciation?: string;
  user_role?: string;
}

// Session types
export interface Session {
  currentUser: User | null;
  currentTask: string;
}

// Errors state
export interface ErrorsState {
  session: string[];
}

// Root Redux state
export interface RootState {
  session: Session;
  errors: ErrorsState;
}

// Sign In form types
export interface SignInUser {
  username: string;
  password: string;
}

// Sign Up form types
export interface SignUpUser {
  username: string;
  email: string;
  password: string;
  preferred_name: string;
  pronunciation: string;
  user_role: string;
}

// Action types
export interface Action<T = any> {
  type: string;
  payload?: T;
}
