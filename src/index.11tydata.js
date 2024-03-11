module.exports = {
  eleventyComputed: {
    articles: (data) => data.collections.promoted.slice(-7),
    modules: (data) =>
      [
        {
          title: '/about',
          url: '/about',
          layout: 'partials/teaser.njk',
          info: {
            img: '/icarus-over-manhattan.jpg',
            img_alt: 'Painting of Icarus over Manhattan by Eric Drooker',
            url: '/about',
            copy: `<em>The Icarus Project</em> envisions a new culture and language
        that resonates with our actual experiences of ’mental illness’
        rather than trying to fit our lives into a conventional framework.
        We are a network of people living with and/or affected by
        experiences that are often diagnosed and labeled as psychiatric
        conditions. We believe these experiences are dangerous gifts
        needing cultivation and care, rather than diseases or disorders.
        By joining together as individuals and as a community, the
        intertwined threads of madness, creativity, and collaboration can
        inspire hope and transformation in an oppressive and damaged
        world. Participation in The Icarus Project helps us overcome
        alienation and tap into the true potential that lies between
        brilliance and madness.`,
          },
        },

        {
          title: '/publications',
          url: '/publications',
          layout: 'partials/carousel.njk',
          modifiers: ['reverse', 'invert', 'carousel', 'full'],
          info: {
            slides: data.collections.publication.map((pub) => ({
              title: pub.data.title,
              subhed: pub.data.subhed,
              img: pub.data.cover,
              img_alt: `Cover of ${pub.data.title}`,
              url: pub.url,
              order: pub.data.order,
            })),
          },
        },

        {
          title: '/articles',
          url: '/articles',
          layout: 'partials/article-grid.njk',
          modifiers: ['invert'],
        },
      ].map((module) => ({
        ...module,
        className: [
          'Module',
          ...(module.modifiers || []).map((m) => `Module--${m}`),
        ].join(' '),
      })),
  },
}
