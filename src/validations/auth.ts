import Yup from './yup';

export const loginSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});
