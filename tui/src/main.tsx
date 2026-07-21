import blessed from 'blessed'

const screen = blessed.screen({
    smartCSR: true,
    title: "Login - RacerFS TUI"
})

// Background box for aesthetics
const background = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: 70,
    height: 20,
    style: {
        bg: 'black'
    }
})

// Login form container
const form = blessed.form({
    parent: background,
    keys: true,
    left: 'center',
    top: 'center',
    width: 66,
    height: 18,
    border: {
        type: 'line'
    },
    style: {
        border: {
            fg: '#00d9ff'
        },
        bg: 'black'
    },
    label: ' RacerFS Login '
})

// Title with decorative separator
blessed.text({
    parent: form,
    top: 1,
    left: 'center',
    content: '╔═════════════════════════════════╗',
    style: {
        fg: '#00d9ff'
    }
})

blessed.text({
    parent: form,
    top: 2,
    left: 'center',
    content: 'Welcome to RacerFS Terminal',
    style: {
        fg: 'white',
        bold: true
    }
})

blessed.text({
    parent: form,
    top: 3,
    left: 'center',
    content: '╚═════════════════════════════════╝',
    style: {
        fg: '#00d9ff'
    }
})

// Username section
blessed.text({
    parent: form,
    top: 6,
    left: 4,
    content: '┌─ Username ─────────────────────────────────────────┐',
    style: {
        fg: '#888888'
    }
})

const usernameInput = blessed.textbox({
    parent: form,
    name: 'username',
    top: 7,
    left: 6,
    height: 1,
    width: 54,
    inputOnFocus: true,
    keys: true,
    mouse: true,
    style: {
        fg: '#ffffff',
        bg: '#1a1a1a',
        focus: {
            fg: '#00ff00',
            bg: '#2a2a2a'
        }
    }
})

blessed.text({
    parent: form,
    top: 8,
    left: 4,
    content: '└────────────────────────────────────────────────────┘',
    style: {
        fg: '#888888'
    }
})

// Password section
blessed.text({
    parent: form,
    top: 10,
    left: 4,
    content: '┌─ Password ─────────────────────────────────────────┐',
    style: {
        fg: '#888888'
    }
})

const passwordInput = blessed.textbox({
    parent: form,
    name: 'password',
    top: 11,
    left: 6,
    height: 1,
    width: 54,
    inputOnFocus: true,
    keys: true,
    mouse: true,
    censor: true,
    style: {
        fg: '#ffffff',
        bg: '#1a1a1a',
        focus: {
            fg: '#00ff00',
            bg: '#2a2a2a'
        }
    }
})

blessed.text({
    parent: form,
    top: 12,
    left: 4,
    content: '└────────────────────────────────────────────────────┘',
    style: {
        fg: '#888888'
    }
})

// Status message
const statusMessage = blessed.text({
    parent: form,
    top: 14,
    left: 'center',
    content: '[Tab] Switch | [Enter] Login | [Esc] Exit',
    style: {
        fg: '#ffff00',
        bold: false
    }
})

// Handle form submit
form.on('submit', (data: any) => {
    const username = data.username || ''
    const password = data.password || ''
    
    if (!username || !password) {
        statusMessage.setContent('Please fill in all fields')
        statusMessage.style.fg = 'red'
        screen.render()
        usernameInput.focus()
        return
    }
    
    // Simple validation (ganti dengan logic sebenarnya)
    if (username === 'admin' && password === 'admin') {
        statusMessage.setContent('Login successful! Welcome, ' + username)
        statusMessage.style.fg = 'green'
        screen.render()
        
        // Keluar setelah 2 detik
        setTimeout(() => {
            process.exit(0)
        }, 2000)
    } else {
        statusMessage.setContent('Invalid username or password')
        statusMessage.style.fg = 'red'
        screen.render()
        passwordInput.clearValue()
        usernameInput.focus()
    }
})

// Tab navigation
usernameInput.key('tab', () => {
    passwordInput.focus()
})

passwordInput.key('tab', () => {
    usernameInput.focus()
})

// Enter on password field submits form
passwordInput.on('submit', () => {
    form.submit()
})

usernameInput.on('submit', () => {
    passwordInput.focus()
})

// Quit on Escape or Ctrl-C
screen.key(['escape', 'C-c'], () => {
    return process.exit(0)
})

// Focus username input initially
usernameInput.focus()

screen.render()