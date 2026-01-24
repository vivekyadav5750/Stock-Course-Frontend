# Error Handling Best Practices

## The Problem

When backend returns validation errors like:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.newPassword",
      "message": "New password must be at least 8 characters"
    }
  ]
}
```

Showing just `"Validation failed"` is not helpful!

## The Solution

Use our error utility functions from `@/lib/utils`:

### 1. Basic Error Display (Most Common)

```typescript
import { getErrorMessage } from '@/lib/utils';

try {
  await authService.changePassword({ currentPassword, newPassword });
} catch (err: any) {
  // ✅ Shows: "New password must be at least 8 characters"
  // Instead of: "Validation failed"
  setError(getErrorMessage(err, "Failed to change password"));
}
```

### 2. Multiple Errors

```typescript
import { getAllErrorMessages } from '@/lib/utils';

try {
  await authService.register(data);
} catch (err: any) {
  const errors = getAllErrorMessages(err);
  // errors = ["Email already exists", "Password too weak"]
  setErrors(errors);
}
```

### 3. Field-Specific Errors (For Forms)

```typescript
import { getFieldErrors } from '@/lib/utils';

try {
  await authService.updateProfile(data);
} catch (err: any) {
  const fieldErrors = getFieldErrors(err);
  // fieldErrors = { newPassword: "Must be at least 8 characters", email: "Invalid format" }
  
  // Now you can show errors next to specific form fields
  if (fieldErrors.newPassword) {
    setPasswordError(fieldErrors.newPassword);
  }
  if (fieldErrors.email) {
    setEmailError(fieldErrors.email);
  }
}
```

## What It Does

The utility automatically:
1. ✅ Extracts specific error messages from `errors` array
2. ✅ Falls back to general `message` if no specific errors
3. ✅ Handles single or multiple errors
4. ✅ Extracts field names for form validation
5. ✅ Works with any error response structure

## Already Updated

These pages now use the error utility:
- ✅ [Login.tsx](../pages/Login.tsx)
- ✅ [Register.tsx](../pages/Register.tsx)
- ✅ [ForgotPassword.tsx](../pages/ForgotPassword.tsx)
- ✅ [ChangePassword.tsx](../pages/ChangePassword.tsx)

## Answer to Your Question

**Q: Should we show `message: "Validation failed"` or `errors[0]?.message`?**

**A: Always show `errors[0]?.message`** (the specific error) when available!

Our `getErrorMessage()` utility does this automatically:
1. First checks if `errors` array exists → uses specific messages
2. Falls back to general `message` if no errors array
3. Uses fallback string if nothing else available

This gives users **actionable feedback** instead of vague messages! 🎯
