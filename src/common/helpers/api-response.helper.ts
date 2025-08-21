export interface ApiResponse<T = any> {
  success: boolean;
  responseMessage: string;
  responseData?: T;
  responseCode: string;
  timestamp: string;
}

export class ApiResponseHelper {
  /**
   * Create a successful API response
   */
  static success<T>(
    responseData: T,
    responseMessage: string = 'Operation completed successfully',
    responseCode: string = '000',
  ): ApiResponse<T> {
    return {
      success: true,
      responseMessage,
      responseData,
      responseCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error API response
   */
  static error(
    responseMessage: string = 'Operation failed',
    responseCode: string = '001',
    responseData?: any,
  ): ApiResponse<any> {
    return {
      success: false,
      responseMessage,
      responseData,
      responseCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a not found response
   */
  static notFound(
    resource: string = 'Resource',
    responseCode: string = '404',
  ): ApiResponse<null> {
    return this.error(
      `${resource} not found`,
      responseCode,
      null,
    );
  }

  /**
   * Create a validation error response
   */
  static validationError(
    errors: any,
    responseCode: string = '400',
  ): ApiResponse<any> {
    return this.error(
      'Validation failed',
      responseCode,
      { errors },
    );
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(
    responseCode: string = '401',
  ): ApiResponse<null> {
    return this.error(
      'Unauthorized access',
      responseCode,
      null,
    );
  }

  /**
   * Create a forbidden response
   */
  static forbidden(
    responseCode: string = '403',
  ): ApiResponse<null> {
    return this.error(
      'Access forbidden',
      responseCode,
      null,
    );
  }

  /**
   * Create a conflict response
   */
  static conflict(
    message: string = 'Resource conflict',
    responseCode: string = '409',
  ): ApiResponse<null> {
    return this.error(
      message,
      responseCode,
      null,
    );
  }
}
