export default {
  type: "object",
  properties: {
    data: { type: "string" },
    name: { type: "string" },
  },
  required: ["data", "name"],
} as const;
