$(document).ready(function () {
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

  console.log('authenticated')
  console.log(firebase.User)

  const database = firebase.database()
  const setText = (elm, str) => $(elm).text(str)
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
  let player1 = ''
  let player2 = ''
  let con = {}

  const updateData = function (parent, test, value) {
    var obj = {}
    obj[test] = value
    database.ref(parent).update(obj)
  }

  const checkMatch = (x, y) => or(x === 3, y === 3) ? setText('#results', 'GAME OVER') : 0

  const draw = function () {
    setText('#results', 'TIE')
    ties++
    updateData('currentGame', 'ties', ties)
  }

  const p1Win = function () {
    setText('#results', p1Selection + ' beats ' + p2Selection)
    p1GameWins++
    updateData(currentP1, 'wins', p1GameWins)
  }

  const p2Win = function () {
    setText('#results', p2Selection + ' beats ' + p1Selection)
    p2GameWins++
    updateData(currentP2, 'wins', p2GameWins)
  }

  let p1Selection = ''
  let p2Selection = ''
  let p1Ready = false
  let p2Ready = false
  let p1GameWins = 0
  let p2GameWins = 0
  let ties = 0

  // hide('.main')

  const user = firebase.auth().currentUser
  let name = ''
  let uid = ''

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('here')
      show('.main')
      console.log(user)
      console.log(player2)
      console.log(player1);
      name = user.displayName
      uid = user.uid
      updateData('users', 'uid', uid)
      updateData('users/' + uid, 'name', name)
      if (player1 === '') {
        updateData(currentP1, 'userId', uid)
        updateData(currentP1, 'name', name)
      } else if (player2 === '') {
        console.log('p2')
        updateData(currentP2, 'userId', uid)
        updateData(currentP2, 'name', name)
      }
    } else {
      console.log('no user')
      console.log(player1)
      console.log(player2)
    }
  })

  hide('.main')
  updateData(currentP1, 'wins', p1GameWins)
  updateData(currentP2, 'wins', p2GameWins)
  updateData('currentGame', 'ties', ties)

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
    if (player1 === uid) {
      p1Selection = $(x).val()
      setText('#p1Selection', p1Selection)
      updateData(currentP1, 'selection', p1Selection)
      p1Ready = true
      console.log(player1)
    } else {
      setText('#p1Selection', 'Wrong Player')
    }
  }

  const p2Click = function (x) {
    if (player2 === uid) {
      p2Selection = $(x).val()
      setText('#p2Selection', p2Selection)
      updateData(currentP2, 'selection', p2Selection)
      p2Ready = true
      console.log(player2);
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
    console.log('data change')
    p1GameWins = snapshot.val().currentGame.player1.wins
    p2GameWins = snapshot.val().currentGame.player2.wins
    p1Selection = snapshot.val().currentGame.player1.selection
    p2Selection = snapshot.val().currentGame.player2.selection
    player1 = snapshot.val().currentGame.player1.userId
    player2 = snapshot.val().currentGame.player2.userId
    setText('#p1Name', snapshot.val().currentGame.player1.name)
    setText('#p2Name', snapshot.val().currentGame.player2.name)
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
