export const securityConfig = {
  argon2: {
    type: 2, // argon2id
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
  },
  password: {
    minLength: 6,
    maxLength: 128,
  },
};