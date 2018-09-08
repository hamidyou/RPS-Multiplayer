$(document).ready(function () {
  let p1Selection = ''
  let p2Selection = ''
  let p1Ready = false
  let p2Ready = false

  const setText = (elm, str) => $(elm).text(str)
  const tie = (x, y) => x === y
  const and = (x, y) => x && y
  const or = (x, y) => x || y
  const rock = (x) => x === 'Rock'
  const paper = (x) => x === 'Paper'
  const scissors = (x) => x === 'Scissors'

  const compare = function (x, y) {
    if (tie(x, y)) {
      setText('#results', 'TIE')
    } else if (or(or(and(rock(x), scissors(y)), and(paper(x), rock(y))), and(scissors(x), paper(y)))) {
      setText('#results', 'Player 1 Wins')
    } else {
      setText('#results', 'Player 2 Wins')
    }
    p1Ready = false
    p2Ready = false
  }

  const p1Click = function (x) {
    p1Selection = $(x).val()
    setText('#p1Selection', p1Selection)
    p1Ready = true
  }

  const p2Click = function (x) {
    p2Selection = $(x).val()
    setText('#p2Selection', p2Selection)
    p2Ready = true
  }

  $(document).on('click', '.p1option', function () {
    p1Click($(this))
    if (p2Ready) {
      compare(p1Selection, p2Selection)
    }
  })

  $(document).on('click', '.p2option', function () {
    p2Click($(this))
    if (p1Ready) {
      compare(p1Selection, p2Selection)
    }
  })
})
