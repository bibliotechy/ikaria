module.exports = {
  eleventyComputed: {
    publications: (data) =>
      data.collections.publication.map((pub, i) => ({
        title: pub.data.title,
        subhed: pub.data.subhed,
        img: pub.data.cover,
        img_alt: `Cover of ${pub.data.title}`,
        copy: pub.data.page.excerpt,
        url: pub.url,
        file: Array.isArray(pub.data.attachments)
          ? pub.data.attachments[0]
          : pub.data.attachments,
        modifierClasses: i % 2 ? 'Teaser--reverse' : '',
      })),
  },
}
