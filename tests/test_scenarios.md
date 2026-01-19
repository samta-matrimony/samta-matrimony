# Admin Login Testing Scenarios

## Test Environment Setup
- Application: Samta Matrimony (React + Vite)
- Test Credentials: samta.matrimony@gmail.com / Samta@0011
- Browser: Default system browser
- Starting URL: http://localhost:5173 (Vite default)

## Test Cases

### 1. Admin Login Success
**Steps:**
1. Navigate to /admin-login
2. Enter email: samta.matrimony@gmail.com
3. Enter password: Samta@0011
4. Click "Access Dashboard"

**Expected Result:**
- Login succeeds
- Redirected to /admin dashboard
- No console errors
- User role set to 'admin'

### 2. Invalid Credentials
**Steps:**
1. Navigate to /admin-login
2. Enter email: samta.matrimony@gmail.com
3. Enter password: wrongpassword
4. Click "Access Dashboard"

**Expected Result:**
- Error message: "Invalid credentials."
- No redirect
- Stay on login page

### 3. Non-Admin User Login Attempt
**Steps:**
1. Register a new regular user account
2. Try to access /admin-login
3. Enter regular user credentials
4. Click "Access Dashboard"

**Expected Result:**
- Error message: "Unauthorized. This portal is for system administrators only."
- No redirect to admin dashboard

### 4. Admin Email Registration Prevention
**Steps:**
1. Navigate to registration page
2. Enter email: samta.matrimony@gmail.com
3. Fill other required fields
4. Submit registration

**Expected Result:**
- Error message: "This email is reserved for system administration."
- Registration fails
- No account created

### 5. Admin Recovery Flow
**Steps:**
1. On admin login page, click "Forgot Access?"
2. Enter email: samta.matrimony@gmail.com
3. Enter recovery key: SAMTA-ADMIN-RECOVERY-2024-GLOBAL
4. Enter new password: newpassword123
5. Submit recovery

**Expected Result:**
- Success message: "Password reset successful. You can now login with your new credentials."
- Can login with new password

### 6. Session Persistence
**Steps:**
1. Login as admin successfully
2. Refresh the page
3. Check if still logged in as admin

**Expected Result:**
- Session restored
- Still have admin access
- No need to re-login

## Test Results Template

### Test Case: [Name]
- **Status:** [PASS/FAIL]
- **Actual Result:** [Description]
- **Screenshots/Logs:** [If applicable]
- **Notes:** [Any issues or observations]

## Performance Checks
- Page load time < 3 seconds
- Login response time < 2 seconds
- No memory leaks in browser dev tools
- No console errors or warnings

## Security Checks
- Password not visible in network requests
- localStorage data properly encrypted/sanitized
- No sensitive data in browser storage
- Proper error messages (no information leakage)
