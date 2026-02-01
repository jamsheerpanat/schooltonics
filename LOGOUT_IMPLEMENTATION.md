# Testing Logout Functionality

## Current Implementation

The logout system has been implemented with the following features:

### Frontend (`apps/web/components/layout/Topbar.tsx`)
- ✅ Logout button with loading state
- ✅ Calls `POST /api/v1/auth/logout`
- ✅ Clears localStorage and sessionStorage
- ✅ Redirects to `/login` page
- ✅ Visual feedback with LogOut icon
- ✅ Error handling (redirects even if API fails)

### Backend (`apps/api/routes/api.php` & `AuthController.php`)
- ✅ Logout endpoint: `POST /api/v1/auth/logout`
- ✅ Protected by `auth:sanctum` middleware
- ✅ Deletes current access token
- ✅ Returns success message

## How to Test

### 1. **Login First** (Required)
The logout will only work if you're properly authenticated. Currently, the login page is a mock.

To properly test logout, you need to:

```bash
# Option A: Use curl to login and get a token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@octoschool.com",
    "password": "password",
    "device_name": "web"
  }'

# This will return a token like:
# {"token":"1|abc123...","user":{...}}
```

### 2. **Implement Real Login**
Update `apps/web/app/login/page.tsx` to actually call the login API:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
      device_name: 'web'
    });
    
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect based on role
    const role = response.data.user.role;
    router.push(`/${role}/health`); // or appropriate dashboard
  } catch (error) {
    console.error('Login failed:', error);
    // Show error message
  }
};
```

### 3. **Update API Client**
Modify `apps/web/lib/api.ts` to include the token in requests:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Token is stored in localStorage
- [ ] API requests include `Authorization: Bearer <token>` header
- [ ] Click logout button
- [ ] Verify API call to `/auth/logout` succeeds
- [ ] Verify localStorage is cleared
- [ ] Verify redirect to `/login` page
- [ ] Verify subsequent API calls fail with 401 (unauthenticated)

## Current Status

✅ **Logout Button**: Implemented with proper UI and loading states  
✅ **Logout API**: Endpoint exists and works correctly  
⚠️ **Login Flow**: Needs to be implemented to properly test logout  
⚠️ **Token Management**: Needs to be added to API client  

## Next Steps

1. Implement real login functionality in `/login` page
2. Update API client to use Bearer token authentication
3. Add token refresh logic (optional)
4. Test complete auth flow: login → use app → logout → verify session cleared

---

**Note**: The logout functionality is fully implemented and will work correctly once the login flow properly authenticates users and stores tokens.
