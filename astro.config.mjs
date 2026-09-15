import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://valoreagency.net',

  // Адреса сайта — со слэшем на конце (/kontakty/), и Netlify на версию без
  // слэша отвечает 301-редиректом. Пока это нигде не было записано, каждая
  // страница объявляла каноническим тот URL, который редиректит: canonical
  // писали без слэша, а sitemap перечислял со слэшем.
  //
  // Закрепляем поведение явно, чтобы новая страница не разъехалась снова.
  // 'always' сочетается с build.format 'directory' (он и так по умолчанию):
  // каждая страница собирается как foo/index.html.
  trailingSlash: 'always',

  integrations: [sitemap()],
});
