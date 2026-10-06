import { defineConfig } from "astro/config";
import shirones from "shirones";

export default defineConfig({
  integrations: [shirones()],
  vite: {
    ssr: {
      noExternal: true,
    },
    build: {

      ssr: true,
    },
  },
});
