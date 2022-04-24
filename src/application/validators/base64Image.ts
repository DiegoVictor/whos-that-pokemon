import { z } from "zod";

const schema = z
  .object({
    base64Image: z
      .string()
      .regex(
        /^data:image\/(png|jpg|jpeg);base64,[a-zA-Z0-9+/]+$/,
        "Must be a base64 image"
      ),
  })
  .required();

type Params = z.infer<typeof schema>;

export const base64Image = (data: Params): Params => schema.parse(data);
