module.exports = {
  eleventyComputed: {
    articles: (data) => data.collections[data.tag],
    activeTag: (data) => data.tag,
  },
}
