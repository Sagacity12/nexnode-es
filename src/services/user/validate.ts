import Ajv from "ajv";
import addFormat from "ajv-formats"
import createHttpError from "http-errors";
import { IUserRegistration, IUserProfileUpdate, IUserLogin } from "../../common/interfaces/user";


/**
 * validate only the sign up and login in data before creating a user 
 * @param data required user data
 */
export const validateAuthData = async (data: IUserRegistration) => {
    const ajv = new Ajv();
    addFormat(ajv);
    ajv.addFormat('email', {
        type: 'string',

        validate: (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
    });
    const schema = {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          minLength: 2,
          maxLength: 100,
        },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8, maxLength: 128 },
      },
      required: ["fullName", "email", "password"],
    };
    const validate = ajv.compile(schema);
    const isValid= validate(data);
    if(!isValid) {
        const errors = validate.errors?.map(error => {
            return { key: error.instancePath, message: error.message};
        });
        throw new createHttpError.BadRequest( JSON.stringify(errors) );
    };
};

/**
 * Validate user login data
 * @param data - Required login data
 */
export const validateLoginData = async (data: IUserLogin) => {
  const ajv = new Ajv();
  addFormat(ajv);

  ajv.addFormat("email", {
    type: "string",
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
  });

  const schema = {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        minLength: 1,
      },
    },
    required: ["email", "password"],
    additionalProperties: false,
  };

  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    const errors = validate.errors?.map((error) => {
      const field =
        error.instancePath.replace("/", "") ||
        error.params?.missingProperty ||
        "unknown";
      return {
        field: field,
        message: `${field}: ${error.message}`,
      };
    });
    throw new createHttpError.BadRequest(
      JSON.stringify({
        message: "Login validation failed",
        errors,
      })
    );
  }
};


/**
 * validate user profile data before creating a user profile
 * @param data required user profile data
 */
export const validateProfileData = async (data: IUserProfileUpdate ) => {
    const ajv = new Ajv();
    addFormat(ajv);

    ajv.addFormat("email", {
      type: "string",
      validate: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
    });

    ajv.addFormat('phone', {
        type: 'string',
        validate: (value: string) => {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }
    });

    const schema = {
      type: "object",
      properties: {
        fullName: { type: "string", maxlength: 100 },
        phone: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" },
        profilePicture: { type: "string", format: "url"},
        email: { type: "string"},
        role: { type: "string", enum: ["ADMIN", "CLIENT"] },
        Biography: { type: "string", maxLength: 500}, 
      },
    };

    const validate = ajv.compile(schema);
    const isValid = validate(data);
    if(!isValid) {
        const errors = validate.errors?.map(error => {
            return { key: error.instancePath, message: error.message };
        })
        throw new createHttpError.BadRequest(JSON.stringify(errors));
    };
};

/**
 * Validate password change data
 * @param data - Password change data
 */
export const validatePasswordChange = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const ajv = new Ajv();

  const schema = {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        minLength: 1,
      },
      newPassword: {
        type: "string",
        minLength: 8,
        maxLength: 128,
      },
      confirmPassword: {
        type: "string",
        minLength: 8,
        maxLength: 128,
      },
    },
    required: ["currentPassword", "newPassword", "confirmPassword"],
    additionalProperties: false,
  };

  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    const errors = validate.errors?.map((error) => {
      const field =
        error.instancePath.replace("/", "") ||
        error.params?.missingProperty ||
        "unknown";
      return {
        field: field,
        message: `${field}: ${error.message}`,
      };
    });
    throw new createHttpError.BadRequest(
      JSON.stringify({
        message: "Password validation failed",
        errors,
      })
    );
  }

  // Check if passwords match
  if (data.newPassword !== data.confirmPassword) {
    throw new createHttpError.BadRequest(
      JSON.stringify({
        message: "Password confirmation failed",
        errors: [
          { field: "confirmPassword", message: "Passwords do not match" },
        ],
      })
    );
  }
};


/**
 * Validate OTP verification data
 * @param data - OTP verification data
 */
export const validateOTPData = async (data: {
  otp: string;
  email?: string;
  phone?: string;
}) => {
  const ajv = new Ajv();
  addFormat(ajv);

  ajv.addFormat("email", {
    type: "string",
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
  });

  const schema = {
    type: "object",
    properties: {
      otp: {
        type: "string",
        pattern: "^[0-9]{4,8}$", // 4-8 digit OTP
      },
      email: {
        type: "string",
        format: "email",
      },
      phone: {
        type: "string",
        pattern: "^\\+?[1-9]\\d{1,14}$",
      },
    },
    required: ["otp"],
    additionalProperties: false,
  };

  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    const errors = validate.errors?.map((error) => {
      const field =
        error.instancePath.replace("/", "") ||
        error.params?.missingProperty ||
        "unknown";
      return {
        field: field,
        message: `${field}: ${error.message}`,
      };
    });
    throw new createHttpError.BadRequest(
      JSON.stringify({
        message: "OTP validation failed",
        errors,
      })
    );
  }
};
