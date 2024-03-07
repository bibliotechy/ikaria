module.exports = {
  eleventyComputed: {
    publications: (data) =>
      data.collections.publication
        .map((pub) => ({
          title: pub.data.title,
          subhed: pub.data.subhed,
          img: pub.data.cover,
          img_alt: `Cover of ${pub.data.title}`,
          copy: pub.data.page.excerpt,
          url: pub.url,
          order: pub.data.order,
          author: pub.data.author,
          file: Array.isArray(pub.data.attachments)
            ? pub.data.attachments[0]
            : pub.data.attachments,
        }))
        .sort((a, b) => Math.sign(a.order - b.order))
        .map((pub, i) => ({
          ...pub,
          modifierClasses: i % 2 ? 'Teaser--reverse' : '',
        })),
  },
}
