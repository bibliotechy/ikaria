module.exports = {
  eleventyComputed: {
    hero_img: (data) => data.hero_img || data.cover,
  },
}
