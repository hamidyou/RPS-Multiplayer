$(document).ready(function () {
  const database = firebase.database()
  const setText = (elm, str) => $(elm).text(str)
  const tie = (x, y) => x === y
  const and = (x, y) => x && y
  const or = (x, y) => x || y
  const rock = (x) => x === 'Rock'
  const paper = (x) => x === 'Paper'
  const scissors = (x) => x === 'Scissors'
  const currentP1 = 'currentGame/player1/'
  const currentP2 = 'currentGame/player2/'
  let player1 = ''
  let player2 = ''
  let con = {}

  const setData = function (parent, test, value) {
    var obj = {}
    obj[test] = value
    database.ref(parent).update(obj)
  }

  const checkMatch = (x, y) => or(x === 3, y === 3) ? setText('#results', 'GAME OVER') : 0

  const draw = function () {
    setText('#results', 'TIE')
    ties++
    setData('currentGame', 'ties', ties)
  }

  const p1Win = function () {
    setText('#results', p1Selection + ' beats ' + p2Selection)
    p1GameWins++
    setData(currentP1, 'wins', p1GameWins)
  }

  const p2Win = function () {
    setText('#results', p2Selection + ' beats ' + p1Selection)
    p2GameWins++
    setData(currentP2, 'wins', p2GameWins)
  }

  let p1Selection = ''
  let p2Selection = ''
  let p1Ready = false
  let p2Ready = false
  let p1GameWins = 0
  let p2GameWins = 0
  let ties = 0

  setData(currentP1, 'wins', p1GameWins)
  setData(currentP2, 'wins', p2GameWins)
  setData('currentGame', 'ties', ties)

  const compare = function (x, y) {
    if (tie(x, y)) {
      draw()
    } else if (or(or(and(rock(x), scissors(y)), and(paper(x), rock(y))), and(scissors(x), paper(y)))) {
      p1Win()
    } else {
      p2Win()
    }
    setText('#score', p1GameWins + ' - ' + p2GameWins + ' - ' + ties)
    checkMatch(p1GameWins, p2GameWins)
    p1Ready = false
    p2Ready = false
  }

  const p1Click = function (x) {
    if (player1 === con.key) {
      p1Selection = $(x).val()
      setText('#p1Selection', p1Selection)
      setData(currentP1, 'selection', p1Selection)
      p1Ready = true
    }
  }

  const p2Click = function (x) {
    if (player2 === con.key) {
      p2Selection = $(x).val()
      setText('#p2Selection', p2Selection)
      setData(currentP2, 'selection', p2Selection)
      p2Ready = true
    } else {
      setText('#p2Selection', 'Wrong Player')
    }
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

  database.ref().on('value', function (snapshot) {
    p1GameWins = snapshot.val().currentGame.player1.wins
    p2GameWins = snapshot.val().currentGame.player2.wins
    p1Selection = snapshot.val().currentGame.player1.selection
    p2Selection = snapshot.val().currentGame.player2.selection
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code)
  })

  // Store Connections
  const connectionsRef = database.ref('/connections')

  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes.
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  const connectedRef = database.ref('.info/connected')

  // When the client's connection state changes...
  connectedRef.on('value', function (snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      con = connectionsRef.push(true)
      if (player1 === '') {
        setData(currentP1, 'userId', con.key)
        player1 = con.key
      } else if (player2 === '') {
        setData(currentP2, 'userId', con.key)
        player1 = con.key
      }
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove()
    }
  })

  // When first loaded or when the connections list changes...
  connectionsRef.on('value', function (snap) {
    if (snap.numChildren === 2) {
      setText('#results', 'You May Begin')
    }
  })
})