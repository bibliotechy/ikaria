module.exports = {
  eleventyComputed: {
    articles: (data) => data.collections.promoted.slice(-7),
  },
}
