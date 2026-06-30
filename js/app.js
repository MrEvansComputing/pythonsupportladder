
function qs(sel, root=document){return root.querySelector(sel)}
function qsa(sel, root=document){return Array.from(root.querySelectorAll(sel))}

qsa('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = qs('#' + btn.dataset.copy)
    if(!target) return
    navigator.clipboard.writeText(target.innerText).then(() => {
      const old = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(()=>btn.textContent = old, 1200)
    })
  })
})

qsa('.drag-area').forEach(area => {
  area.addEventListener('dragover', e => {
    e.preventDefault()
    const dragging = qs('.dragging')
    const after = getDragAfterElement(area, e.clientY)
    if(!dragging) return
    if(after == null){area.appendChild(dragging)} else {area.insertBefore(dragging, after)}
  })
})

qsa('.drag-card').forEach(card => {
  card.setAttribute('draggable','true')
  card.addEventListener('dragstart', () => card.classList.add('dragging'))
  card.addEventListener('dragend', () => card.classList.remove('dragging'))
  const up = qs('[data-move="up"]', card)
  const down = qs('[data-move="down"]', card)
  if(up){up.addEventListener('click', e => {e.stopPropagation(); const p=card.previousElementSibling; if(p) card.parentElement.insertBefore(card,p)})}
  if(down){down.addEventListener('click', e => {e.stopPropagation(); const n=card.nextElementSibling; if(n) card.parentElement.insertBefore(n,card)})}
})

function getDragAfterElement(container, y){
  const els = [...container.querySelectorAll('.drag-card:not(.dragging)')]
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height/2
    if(offset < 0 && offset > closest.offset){return {offset, element: child}}
    return closest
  }, {offset: Number.NEGATIVE_INFINITY}).element
}

qsa('[data-check-drag]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.checkDrag
    const area = qs('#' + id)
    const feedback = qs('#' + id + '-feedback')
    const expected = (area.dataset.order || '').split(',')
    const actual = qsa('.drag-card', area).map(card => card.dataset.id)
    const correct = expected.length === actual.length && expected.every((v,i)=>v===actual[i])
    feedback.textContent = correct ? 'Correct order. Now type it into IDLE and run it.' : 'Not quite. Read the lines from top to bottom and check the logic again.'
    feedback.className = 'feedback ' + (correct ? 'ok' : 'bad')
  })
})

qsa('[data-reset-drag]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.resetDrag
    const area = qs('#' + id)
    const cards = qsa('.drag-card', area)
    cards.sort(() => Math.random() - 0.5).forEach(c => area.appendChild(c))
    const feedback = qs('#' + id + '-feedback')
    if(feedback){feedback.textContent = ''; feedback.className = 'feedback'}
  })
})

function norm(x){
  return (x || '').trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").toLowerCase()
}
qsa('[data-check-blanks]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.checkBlanks
    const box = qs('#' + id)
    const feedback = qs('#' + id + '-feedback')
    let total = 0, correct = 0
    qsa('input[data-answer]', box).forEach(input => {
      total++
      const ok = norm(input.value) === norm(input.dataset.answer)
      if(ok) correct++
      input.style.borderColor = ok ? '#16a34a' : '#dc2626'
      input.style.background = ok ? '#ecfdf5' : '#fef2f2'
    })
    const all = correct === total
    feedback.textContent = all ? `All ${total} gaps are correct. Now try typing the full code into IDLE.` : `${correct}/${total} correct. Use the word bank and the worked example to fix the red boxes.`
    feedback.className = 'feedback ' + (all ? 'ok' : 'bad')
  })
})
