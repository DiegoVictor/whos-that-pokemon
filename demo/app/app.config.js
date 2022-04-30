import 'dotenv/config';

export default {
  name: 'whos-that-pokemon',
  version: '1.0.0',
  extra: {
    recognition_url: process.env.RECOGNITION_URL,
  },
};
