export type User = {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: "Login successful";
  user: User;
};

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: "User registered successfully. Check your email for the OTP.";
  user: User;
};

export type VerifyEmailBody = {
  email: string;
  otp: string;
};

export type VerifyEmailResponse = {
  message: "Email verified successfully";
  user: User;
};

export type ResendEmailBody = {
  email: string;
};

export type ResendEmailResponse = {
  message: "Email sent successfully!";
};

export type AuthRouteErrorResponse = {
  message: string;
  requestId?: string | null;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
  stack?: string;
};

export type AuthRouteError = {
  ok: false;
  status: 400 | 401 | 404 | 409 | 429 | 500;
  error: AuthRouteErrorResponse;
};

export type LoginResult =
  | ({ ok: true; status: 200 } & LoginResponse)
  | AuthRouteError;

export type RegisterResult =
  | ({ ok: true; status: 201 } & RegisterResponse)
  | AuthRouteError;

export type VerifyEmailResult =
  | ({ ok: true; status: 200 } & VerifyEmailResponse)
  | AuthRouteError;

export type ResendEmailResult =
  | ({ ok: true; status: 201 } & ResendEmailResponse)
  | AuthRouteError;
