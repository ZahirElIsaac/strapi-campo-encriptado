import bootstrap from './bootstrap';
import decrypt from './middlewares/decrypt';
import register from './register';

const plugin = {
  register,
  bootstrap,
  middlewares: {
    decrypt,
  },
};

export default plugin;
