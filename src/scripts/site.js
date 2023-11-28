/* global d3 */
window.graphNav = {
  containerNode: document.getElementById('nav-graph-target'),

  menuNode: document.getElementById('menu'),

  keepOpen: false,

  create() {
    this.destroy()

    const { nodes, edges } = Array.from(this.menuNode.querySelectorAll('a'))
      .map((el, i) => ({
        id: i,
        text: el.text,
        href: el.href,
        links: (el.dataset.links || '').split(',').map(Number),
      }))
      .reduce(
        (acc, { id, text, href, links }) => {
          acc.nodes.push({ id, text, href })
          links.forEach((target) => {
            acc.edges.push({ source: id, target })
          })

          return acc
        },
        { nodes: [], edges: [] },
      )

    // The edges of the svg are where the nodes get cropped if you pull it.
    // Keep them the same aspect ratio as background image.
    const width = 1440
    const height = 1053
    const radius = 80
    const strength = -9000

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(edges).id((d) => d.id),
      )
      .force(
        'center',
        d3.forceCenter(width / 2, Math.max(window.innerHeight, 700) / 2),
      )
      .force('charge', d3.forceManyBody().strength(strength))

    // Create the SVG container.
    const svg = d3
      .create('svg')
      .attr('width', '100%')
      .attr('viewBox', [0, 0, width, height])
      .classed('NavGraph', true)

    // Add the arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', 'currentColor')
      .attr('fill', '#f00')
      .attr('d', 'M0,-5L10,0L0,5')

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append('g')
      .classed('NavGraph-edges', true)
      .selectAll()
      .data(edges)
      .join('line')
      // .join('path')
      .attr('marker-end', `url(${new URL(`#arrow`, window.location)})`)
      .classed('NavGraph-edge', true)

    const links = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .classed('NavGraph-nodes', true)
      .selectAll()
      .data(nodes)
      .join('a')
      .attr('href', (d) => d.href)
      .classed('NavGraph-link', true)

    const node = links
      .append('circle')
      .attr('r', radius)
      .classed('NavGraph-node', true)

    const labels = links
      .append('foreignObject')
      .attr('width', radius * 2)
      .attr('height', radius * 2)
      .attr('x', (d) => d.x - radius)
      .attr('y', (d) => d.y - radius)

    labels
      .append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .classed('NavGraph-label', true)
      .append('xhtml:span')
      .classed('NavGraph-labelInner', true)
      .text((d) => d.text)

    // Set the position attributes of links and nodes each time the simulation
    // ticks.
    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      labels.attr('x', (d) => d.x - radius).attr('y', (d) => d.y - radius)
    }

    /* eslint-disable no-param-reassign */

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    /* eslint-enable no-param-reassign */

    simulation.on('tick', ticked)

    // Add a drag behavior.
    links.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    )

    // Skip the insane default fly-in animation
    simulation.tick(10)

    this.containerNode.replaceChildren()
    this.containerNode.append(svg.node())
  },

  destroy() {
    if (this.keepOpen) return
    this.containerNode.replaceChildren()
  },
}
;(() => {
  const menuButton = document.getElementById('menu-button')
  const isMobile = () =>
    parseInt(getComputedStyle(document.body).getPropertyValue('--bp-l'), 10) >=
    window.innerWidth
  let wasMobile = isMobile()
  let isOpen = false

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', false)
    document.body.classList.remove('is-menuOpen')
    window.graphNav.destroy()
    isOpen = false
  }

  const openMenu = () => {
    menuButton.setAttribute('aria-expanded', true)

    if (isMobile()) document.body.classList.add('is-menuOpen')
    else window.graphNav.create()

    document.addEventListener(
      'keyup',
      (e) => {
        if (e.key === 'Escape') closeMenu()
      },
      false,
    )
    isOpen = true
  }

  const toggleMenu = () => (isOpen ? closeMenu() : openMenu())

  menuButton.addEventListener('click', toggleMenu, false)

  window.addEventListener('resize', () => {
    if (isMobile() !== wasMobile) closeMenu()
    wasMobile = isMobile()
  })
})()
