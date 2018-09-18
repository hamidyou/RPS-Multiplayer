$(document).ready(() => {
  const setText = (elm, str) => $(elm).text(str)
  // const empty = elm => $(elm).empty()
  const tie = (x, y) => x === y
  const and = (x, y) => x && y
  const or = (x, y) => x || y
  const rock = x => x === 'Rock'
  const paper = x => x === 'Paper'
  const scissors = x => x === 'Scissors'
  const hide = x => $(x).hide()
  const show = x => $(x).show()
  let data = {}
  let con = {}
  let p1Selection = ''
  let p2Selection = ''
  let winSelection = ''
  let lossSelection = ''
  let p1Ready = false
  let p2Ready = false
  let p1Wins = 0
  let p2Wins = 0
  let ties = 0
  let name = ''
  let uid = ''

  // Initialize the FirebaseUI Widget using Firebase.
  const ui = new firebaseui.auth.AuthUI(firebase.auth())

  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        return false
      },
      uiShown: function () {
        document.getElementById('loader').style.display = 'none'
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ]
    // Terms of service url.
    // tosUrl: '<your-tos-url>',
    // Privacy policy url.
    // privacyPolicyUrl: '<your-privacy-policy-url>'
  }

  ui.start('#firebaseui-auth-container', {
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: false
      },
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
    ]
    // Other config options...
  })

  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig)

  const database = firebase.database()
  const rootRef = database.ref()
  const usersRef = rootRef.child('users')
  const currentGameRef = rootRef.child('currentGame')
  const player1ref = currentGameRef.child('player1')
  const p1WinsRef = player1ref.child('wins')
  const p1ReadyRef = player1ref.child('ready')
  const p1NameRef = player1ref.child('name')
  const p1SelectionRef = player1ref.child('selection')
  const p1userIdRef = player1ref.child('userId')
  const player2ref = currentGameRef.child('player2')
  const p2WinsRef = player2ref.child('wins')
  const p2ReadyRef = player2ref.child('ready')
  const p2NameRef = player2ref.child('name')
  const p2SelectionRef = player2ref.child('selection')
  const p2userIdRef = player2ref.child('userId')
  const tiesRef = currentGameRef.child('ties')
  const winSelectionRef = currentGameRef.child('winSelection')
  const lossSelectionRef = currentGameRef.child('lossSelection')

  const isPlayerNull = kyanite.curry(function (player, x) {
    console.log(player)
    console.log(x)
    return kyanite.pipe([
      kyanite.path(['currentGame', player, 'userId']),
      kyanite.isNil
    ], data)
  })

  const createUser = function (x) {
    usersRef.child(x.uid).set({
      name: x.displayName
    })
    return x
  }

  const updatePlayer = kyanite.curry(function (player, x) {
    console.log(player)
    console.log(x)
    const [hidePlayer, ref] = player === 'player1' ? ['#p2hide', player1ref] : ['#p1hide', player2ref]

    ref.child('userId').set(x.uid)
    ref.child('name').set(x.displayName)

    hide(hidePlayer)
  })

  firebase.auth().onAuthStateChanged(function (x) {
    if (x) {
      kyanite.pipe([
        createUser,
        // Check to see if a user exists in player 1 slot
        // If not place the new user there
        // If so place go on to check player 2 slot
        kyanite.branch(
          isPlayerNull('player2'),
          updatePlayer('player2'),

          // Check to see if a user exists in player 2 slot
          // If not place the new user there
          // If so place the user in a queue
          kyanite.branch(
            isPlayerNull('player1'),
            updatePlayer('player1'),
            setText('#score', 'Game currently in progress. Please wait your turn.')))
      ], x)
      show('.main')
    } else {
      console.log('no user')
    }
  })
  // const updateData = function (parent, key, value) {
  //   var obj = {}
  //   obj[key] = value
  //   database.ref(parent).update(obj)
  // }

  const initialize = function () {
    hide('#results')
    tiesRef.set(0)
    p1WinsRef.set(0)
    p1ReadyRef.set(false)
    p2WinsRef.set(0)
    p2ReadyRef.set(false)
    winSelectionRef.set('')
    lossSelectionRef.set('')
    p1NameRef.set('Waiting for Opponent')
    p2NameRef.set('Waiting for Opponent')
  }

  const p1Click = function (x) {
    p1Selection = $(x).val()
    p1Ready = true
    setText('#p1Selection', p1Selection)
    p1SelectionRef.set(p1Selection)
    p1ReadyRef.set(p1Ready)
  }

  const p2Click = function (x) {
    p2Selection = $(x).val()
    p2Ready = true
    setText('#p2Selection', p2Selection)
    p2SelectionRef.set(p2Selection)
    p2ReadyRef.set(p2Ready)
  }

  $(document).on('click', '.p1option', () => {
    p1Click($(this))
    if (data.currentGame.player2.ready) {
      compare(data.currentGame.player1.selection, data.currentGame.player2.selection)
    }
  })

  $(document).on('click', '.p2option', () => {
    p2Click($(this))
    if (data.currentGame.player1.ready) {
      compare(data.currentGame.player1.selection, data.currentGame.player2.selection)
    }
  })

  p1NameRef.on('value', x => setText('#p1Name', x.val()))
  p2NameRef.on('value', x => setText('#p2Name', x.val()))

  p1ReadyRef.on('value', x => x.val() ? setText('#p2OppSel', 'Selected') : setText('#p2OppSel', 'Thinking...'))
  p2ReadyRef.on('value', x => x.val() ? setText('#p1OppSel', 'Selected') : setText('#p1OppSel', 'Thinking...'))

  p1WinsRef.on('value', x => {
    setText('#score', x.val() + ' - ' + data.currentGame.ties + ' - ' + data.currentGame.player2.wins)
    checkMatch(data.currentGame.player1.wins, data.currentGame.player2.wins)
  })
  p2WinsRef.on('value', x => {
    setText('#score', data.currentGame.player1.wins + ' - ' + data.currentGame.ties + ' - ' + x.val())
    checkMatch(data.currentGame.player1.wins, data.currentGame.player2.wins)
  })
  tiesRef.on('value', (x) => {
    setText('#score', data.currentGame.player1.wins + ' - ' + x.val() + ' - ' + data.currentGame.player2.wins)
    setText('#results', 'TIE')
  })

  winSelectionRef.on('value', function (x) {
    console.log(data)
    setText('#results', data.currentGame.player1.selection + ' beats ' + data.currentGame.player2.selection)
    winSelectionRef.set(false)
  })
  lossSelectionRef.on('value', function (x) {
    console.log(data)
    setText('#results', data.currentGame.player2.selection + ' beats ' + data.currentGame.player1.selection)
    lossSelectionRef.set(false)
  })

  const compare = function (x, y) {
    setText('#p1OppSel', '')
    setText('#p2OppSel', '')
    show('#results')
    if (tie(x, y)) {
      draw()
    } else if (or(or(and(rock(x), scissors(y)), and(paper(x), rock(y))), and(scissors(x), paper(y)))) {
      p1Win()
    } else {
      p2Win()
    }
    p1ReadyRef.set(false)
    p2ReadyRef.set(false)
  }

  const p1Win = function () {
    winSelectionRef.set(true)
    setText('#results', data.currentGame.player1.selection + ' beats ' + data.currentGame.player2.selection)
    p1Wins = data.currentGame.player1.wins
    p1Wins++
    p1WinsRef.set(p1Wins)
  }

  const p2Win = function () {
    lossSelectionRef.set(true)
    setText('#results', data.currentGame.player2.selection + ' beats ' + data.currentGame.player1.selection)
    p2Wins = data.currentGame.player2.wins
    p2Wins++
    p2WinsRef.set(p2Wins)
  }

  const checkMatch = (x, y) => or(x === 2, y === 2) ? setText('#results', 'GAME OVER') : 0

  const draw = function () {
    setText('#results', 'TIE')
    ties = data.currentGame.ties
    ties++
    tiesRef.set(ties)
  }

  database.ref().on('value', function (snapshot) {
    data = snapshot.val()
    console.log(data)
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code)
  })

  hide('.main')
  initialize()

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
