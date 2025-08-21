export interface UserProfile {
  id: string;                          // UUID - Primary key
  email: string;                       // User's email address
  firstName: string;                   // User's first name
  lastName: string;                    // User's last name
  fullName: string;                    // Computed: firstName + lastName
  phoneNumber: string | null;          // Phone number (nullable)
  status: string;                      // User status: "active" | "inactive" | "suspended"
  roles: string[];                     // Array of role names
  permissions: string[];               // Array of permission strings
  lastLoginAt: string | null;          // ISO 8601 timestamp of last login
  createdAt: string;                   // ISO 8601 timestamp of account creation
}

export interface LoginResponse {
  success: boolean;
  responseMessage: string;
  responseData: {
    user: UserProfile;
    sessionId: string;
  };
  timestamp: string;
}
