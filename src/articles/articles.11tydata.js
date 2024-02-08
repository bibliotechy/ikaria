module.exports = {
  eleventyComputed: {
    taglist: (data) => Object.keys(data.collections),
    articles: (data) => data.collections.article,
  },
}
