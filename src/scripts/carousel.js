document.addEventListener('DOMContentLoaded', () => {
  const setSwiperOffsets = (swiperEl, swiperNavEl) => {
    const { width } = swiperNavEl.getBoundingClientRect()
    const { paddingLeft, paddingRight } = window.getComputedStyle(swiperNavEl)
    const w = width - parseFloat(paddingLeft) - parseFloat(paddingRight)
    const offset = (window.innerWidth - w) / 2
    swiperEl.setAttribute('slides-offset-before', offset)
    swiperEl.setAttribute('slides-offset-after', offset)
  }

  document.querySelectorAll('.Carousel').forEach((el) => {
    const swiperEl = el.querySelector('swiper-container')
    const swiperNavEl = el.querySelector('.Carousel-nav')
    const prevEl = el.querySelector('.Carousel-prev')
    const nextEl = el.querySelector('.Carousel-next')
    const offset = () => setSwiperOffsets(swiperEl, swiperNavEl)

    window.addEventListener('resize', offset)

    Object.assign(swiperEl, { navigation: { nextEl, prevEl } })
    offset()
    swiperEl.initialize()
  })
})
