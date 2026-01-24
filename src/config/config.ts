const _config = {
    baseApi: process.env.NEXT_PUBLIC_APP_BASE_API,
    baseUrl: process.env.APP_BASE_URL,
    apiToken: process.env.API_TOKEN,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
};

export const config = {
    get: (variable: keyof typeof _config): string => {
        if (!_config.hasOwnProperty(variable)) {
            console.error(`Invalid environment variable: ${variable}`);
            process.exit(1);
        }

        const value = _config[variable];

        if (!value) {
            console.error(`Missing environment variable: ${variable}`);
            process.exit(1);
        }
        return String(value);
    },
};