$(document).ready(function () {
  // const auth = firebase.auth()
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
  const currentP1 = 'currentGame/player1/'
  const currentP2 = 'currentGame/player2/'
  let data = {}
  let player1 = ''
  let player2 = ''
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

  firebase.auth().onAuthStateChanged(function (x) {
    if (x) {
      login(x)
      if (typeof data.currentGame.player1.userId === 'undefined') updateP1()
      else if (typeof data.currentGame.player2.userId === 'undefined') updateP2()
      else alert('Please wait your turn')
    } else {
      console.log('no user')
    }
  })

  const login = function (x) {
    show('.main')
    name = x.displayName
    uid = x.uid
    usersRef.child(uid).set({
      name: name
    })
  }

  const updateP1 = function () {
    p1userIdRef.set(uid)
    p1NameRef.set(name)
    setText('#p1Name', data.currentGame.player1.name)
    hide('#p2hide')
  }

  const updateP2 = function () {
    p2userIdRef.set(uid)
    p2NameRef.set(name)
    setText('#p2Name', data.currentGame.player2.name)
    hide('#p1hide')
  }

  const updateData = function (parent, key, value) {
    var obj = {}
    obj[key] = value
    database.ref(parent).update(obj)
  }

  const initialize = function () {
    tiesRef.set(ties)
    p1WinsRef.set(p1Wins)
    p1ReadyRef.set(p1Ready)
    p2WinsRef.set(p2Wins)
    p2ReadyRef.set(p2Ready)
    winSelectionRef.set(winSelection)
    lossSelectionRef.set(lossSelection)
  }

  const p1Click = function (x) {
    p1Selection = $(x).val()
    setText('#p1Selection', p1Selection)
    p1SelectionRef.set(p1Selection)
    p1ReadyRef.set(p1Ready)
  }

  const p2Click = function (x) {
    p2Selection = $(x).val()
    setText('#p2Selection', p2Selection)
    p2SelectionRef.set(p2Selection)
    p2ReadyRef.set(p2Ready)
  }

  $(document).on('click', '.p1option', function () {
    p1Click($(this))
    if (data.p2Ready) {
      compare(data.p1SelectionRef, data.p2SelectionRef)
    }
  })

  $(document).on('click', '.p2option', function () {
    p2Click($(this))
    if (data.p1Ready) {
      compare(data.p1Selection, data.p2Selection)
    }
  })

  const compare = function (x, y) {
    console.log(data)
    if (tie(x, y)) {
      draw()
    } else if (or(or(and(rock(x), scissors(y)), and(paper(x), rock(y))), and(scissors(x), paper(y)))) {
      p1Win()
      console.log(data)
    } else {
      p2Win()
    }
    setText('#score', data.p1WinsRef + ' - ' + data.p2WinsRef + ' - ' + data.tiesRef)
    checkMatch(p1Wins, p2Wins)
    updateData(currentP1, 'ready', false)
    updateData(currentP2, 'ready', false)
  }

  const p1Win = function () {
    // setText('#results', p1Selection + ' beats ' + p2Selection)
    winSelection = p1Selection
    winSelectionRef.set(winSelection)
    lossSelection = p2Selection
    lossSelectionRef.set(lossSelection)
    p1Wins++
    p1WinsRef.set(p1Wins)
  }

  const p2Win = function () {
    // setText('#results', p2Selection + ' beats ' + p1Selection)
    winSelection = p2Selection
    winSelectionRef.set(winSelection)
    lossSelection = p1Selection
    lossSelectionRef.set(lossSelection)
    p2Wins++
    p2WinsRef.set(p2WinsRef)
  }

  const checkMatch = function (x, y) {
    if (or(x === 3, y === 3)) {
      setText('#results', 'GAME OVER')
    }
  }

  const draw = function () {
    setText('#results', 'TIE')
    ties++
    updateData('currentGame', 'ties', ties)
  }



  database.ref().on('value', function (snapshot) {
    data = snapshot.val()
    // p1Wins = data.currentGame.player1.wins
    // p2Wins = data.currentGame.player2.wins
    // ties = data.currentGame.ties
    // setText('#score', p1Wins + ' - ' + p2Wins + ' - ' + ties)
    // p1Selection = data.currentGame.player1.selection
    // p2Selection = data.currentGame.player2.selection
    // winSelection = data.currentGame.winSelection
    // setText('#results', winSelection + ' beats ' + lossSelection)
    // lossSelection = data.currentGame.lossSelection
    // setText('#results', winSelection + ' beats ' + lossSelection)
    // player1 = data.currentGame.player1.userId
    // player2 = data.currentGame.player2.userId
    // p1Ready = data.currentGame.player1.ready
    // p2Ready = data.currentGame.player2.ready
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
