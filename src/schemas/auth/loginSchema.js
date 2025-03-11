import Joi from 'joi';

// Regular expressions for validation
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Login schema with detailed validation rules and custom error messages
export const loginSchema = Joi.object({
    email: Joi.alternatives()
        .try(
            Joi.string().pattern(USERNAME_PATTERN).messages({
                'string.pattern.base':
                    'Username must be 3-30 characters long and can only contain letters, numbers, and underscores',
            }),
            Joi.string()
                .email({ tlds: { allow: false } })
                .pattern(EMAIL_PATTERN)
                .messages({
                    'string.email': 'Please enter a valid email address',
                    'string.pattern.base': 'Please enter a valid email address',
                })
        )
        .required()
        .messages({
            'any.required': 'Username or email is required',
        }),
    password: Joi.string()
        .min(8)
        .max(72)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 72 characters',
            'string.pattern.base':
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required',
        }),
    remember: Joi.boolean().default(false),
});

// Validation function
export const validateLogin = async (data) => {
    try {
        const value = await loginSchema.validateAsync(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        return { value, error: null };
    } catch (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
        }));
        return { value: null, error: errors };
    }
};
