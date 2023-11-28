/* eslint-disable import/no-extraneous-dependencies */

require('dotenv').config()
const { DateTime } = require('luxon')
const sass = require('sass')
const path = require('node:path')
const browserslist = require('browserslist')
const yaml = require('js-yaml')
const { transform, browserslistToTargets } = require('lightningcss')
const MarkdownIt = require('markdown-it')
const Image = require('@11ty/eleventy-img')
const pluginBundle = require('@11ty/eleventy-plugin-bundle')
const pluginNavigation = require('@11ty/eleventy-navigation')
const { EleventyHtmlBasePlugin } = require('@11ty/eleventy')
const implicitFigures = require('markdown-it-implicit-figures')

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('./{src,public}/**/*.{svg,webp,png,jpg,jpeg}')
  eleventyConfig.addWatchTarget('./src/styles')
  eleventyConfig.addWatchTarget('./src/scripts')
  eleventyConfig.addDataExtension('yml, yaml', (contents) =>
    yaml.load(contents),
  )

  eleventyConfig.addPlugin(pluginNavigation)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)
  eleventyConfig.addPlugin(pluginBundle)

  eleventyConfig.amendLibrary('md', (mdLib) =>
    mdLib.use(implicitFigures, { figcaption: 'title' }),
  )

  // Adapted from https://11ty.rocks/posts/process-css-with-lightningcss/
  eleventyConfig.addTemplateFormats('scss')
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    async compile(inputContent, inputPath) {
      // Skip files like _fileName.scss
      const parsed = path.parse(inputPath)
      if (parsed.name.startsWith('_')) return undefined

      const result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || '.'],
        sourceMap: Boolean(process.env.SOURCE_MAPS),
      })

      // Allow included files from @use or @import to trigger rebuilds when
      // using --incremental
      this.addDependencies(inputPath, result.loadedUrls)

      const targets = browserslistToTargets(browserslist())

      if (process.env.MINIFY)
        return async () => {
          const { code } = await transform({
            code: Buffer.from(result.css),
            minify: true,
            sourceMap: Boolean(process.env.SOURCE_MAPS),
            targets,
          })
          return code
        }

      return () => result.css
    },
  })

  eleventyConfig.addShortcode('image', async (src, alt, sizes) => {
    const metadata = await Image(src, {
      widths: [300, 600],
      formats: ['png', 'webp'],
      outputDir: './public/img',
    })

    const imageAttributes = {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async',
    }

    return Image.generateHTML(metadata, imageAttributes)
  })

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    // Default is '---', but it's nice to be more explicit, and sometimes you
    // just want a <hr /> in your content
    excerpt_separator: '<!-- more -->',
  })

  // Get specific items from a collection by slug
  // https://github.com/11ty/eleventy/discussions/2533#discussioncomment-3410669
  eleventyConfig.addFilter('find', (collection = [], slug = '') => {
    const normalize = (s) => s.replace(/^\/|\/$/g, '')
    const normalizedSlug = normalize(slug)
    return collection.find((item) => normalize(item.url) === normalizedSlug)
  })

  // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd'),
  )

  // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  eleventyConfig.addFilter('readableDate', (dateObj, format, zone) =>
    DateTime.fromJSDate(dateObj, { zone: zone || 'utc' }).toFormat(
      format || 'LLLL yyyy',
    ),
  )

  eleventyConfig.addFilter('filterTagList', (tags) => {
    const ignoredTags = new Set([
      'all',
      'nav',
      'post',
      'posts',
      'article',
      'homepage',
      'gallery',
    ])
    return (tags || []).filter((tag) => !ignoredTags.has(tag))
  })

  // Copy contents of public into build
  eleventyConfig.addPassthroughCopy({ './public/': '/' })
  eleventyConfig.addPassthroughCopy('./src/scripts/**/*.js')

  eleventyConfig.addFilter('toHTML', (str) =>
    new MarkdownIt().renderInline(str),
  )

  return {
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'build',
    },
  }
}
