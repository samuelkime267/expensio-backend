export const emailVerificationTemplate = (otp: string) => `
  <h2>Verify your email</h2>
  <p>Use the following OTP to verify your email address:</p>
  <p><strong>${otp}</strong></p>
  <p>This OTP expires in 10 minutes.</p>
`;

export const passwordResetTemplate = (link: string) => `
  <h2>Reset your password</h2>
  <p>Click the link below to reset your password:</p>
  <a href="${link}">${link}</a>
  <p>This link expires in 10 minutes.</p>
`;
