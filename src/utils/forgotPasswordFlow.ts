const FORGOT_PASSWORD_EMAIL_KEY = 'forgotPasswordEmail';
const FORGOT_PASSWORD_RESET_TOKEN_KEY = 'forgotPasswordResetToken';

export function getForgotPasswordEmail() {
  return sessionStorage.getItem(FORGOT_PASSWORD_EMAIL_KEY) ?? '';
}

export function setForgotPasswordEmail(email: string) {
  sessionStorage.setItem(FORGOT_PASSWORD_EMAIL_KEY, email);
}

export function getForgotPasswordResetToken() {
  return sessionStorage.getItem(FORGOT_PASSWORD_RESET_TOKEN_KEY) ?? '';
}

export function setForgotPasswordResetToken(token: string) {
  sessionStorage.setItem(FORGOT_PASSWORD_RESET_TOKEN_KEY, token);
}

export function clearForgotPasswordFlow() {
  sessionStorage.removeItem(FORGOT_PASSWORD_EMAIL_KEY);
  sessionStorage.removeItem(FORGOT_PASSWORD_RESET_TOKEN_KEY);
}
