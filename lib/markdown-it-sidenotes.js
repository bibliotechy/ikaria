/* eslint-disable no-param-reassign */
module.exports = function sidenote(md) {
  md.renderer.rules.sidenoteRef = (tokens, idx) => {
    const id = `sn-${tokens[idx].meta.id}`
    return `<label for="${id}" class="margin-toggle sidenote-number"></label>\
<input type="checkbox" id="${id}" class="margin-toggle" />`
  }

  md.renderer.rules.sidenote = (tokens, idx) =>
    `<span class="sidenote">${md.renderInline(tokens[idx].content)}</span>`

  md.renderer.rules.marginnoteRef = (tokens, idx) => {
    const id = `mn-${tokens[idx].meta.id}`
    return `<label for="${id}" class="margin-toggle">⊕</label>\
<input type="checkbox" id="${id}" class="margin-toggle"/>`
  }

  md.renderer.rules.marginnote = (tokens, idx) =>
    `<span class="marginnote">${md.renderInline(tokens[idx].content)}</span>`

  const sidenotesInline = (state, silent) => {
    const labelStart = state.pos + 2
    const tokens = []

    if (labelStart >= state.posMax) return false

    const charCode = state.src.charCodeAt(state.pos)
    let noteType
    if (charCode === 0x5e) noteType = 'sidenotes' // starts with ^
    else if (charCode === 0x2b) noteType = 'marginnotes' // starts with +
    else return false
    if (state.src.charCodeAt(state.pos + 1) !== 0x5b /* [ */) return false

    const labelEnd = md.helpers.parseLinkLabel(state, state.pos + 1)

    // parser failed to find ']', so it's not a valid note
    if (labelEnd < 0) return false

    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    if (!silent) {
      if (!state.env.sidenotes) state.env.sidenotes = {}
      if (!state.env.marginnotes) state.env.marginnotes = {}
      if (!state.env.sidenotes.list) state.env.sidenotes.list = []
      if (!state.env.marginnotes.list) state.env.marginnotes.list = []

      const sidenoteId = state.env[noteType].list.length

      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens,
      )

      if (noteType === 'marginnotes') {
        const refToken = state.push('marginnoteRef', '', 0)
        refToken.meta = { id: state.env.marginnotes.list.length }

        const noteToken = state.push('marginnote', '', 0)
        noteToken.content = state.src.slice(labelStart, labelEnd)
        noteToken.children = tokens
      } else {
        const refToken = state.push('sidenoteRef', '', 0)
        refToken.meta = { id: state.env.sidenotes.list.length }

        const noteToken = state.push('sidenote', '', 0)
        noteToken.content = state.src.slice(labelStart, labelEnd)
        noteToken.children = tokens
      }

      state.env[noteType].list[sidenoteId] = {
        content: state.src.slice(labelStart, labelEnd),
        tokens,
      }
    }

    state.pos = labelEnd + 1
    return true
  }

  md.inline.ruler.after('image', 'sidenotesInline', sidenotesInline)
}
