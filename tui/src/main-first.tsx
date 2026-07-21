import { render, Text, Box, useInput } from "ink"
import { useState, useEffect } from "react"

// Mock Backend API
const mockBackendAPI = {
    login: async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
            success: true,
            message: "OTP berhasil dikirim ke email Anda"
        }
    },
    register: async (email: string, name: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
            success: true,
            message: "OTP berhasil dikirim ke email Anda untuk verifikasi"
        }
    },
    verifyOTP: async (email: string, otp: string) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        if (otp === "123456") {
            return {
                success: true,
                message: "Login berhasil!",
                token: "mock-jwt-token-123"
            }
        }
        return {
            success: false,
            message: "Kode OTP salah atau sudah kadaluarsa"
        }
    }
}

type AuthMode = "menu" | "login" | "register" | "otp"
type InputField = "email" | "name"

const AuthScreen = ({ onAuthenticated }: { onAuthenticated: () => void }) => {
    const [mode, setMode] = useState<AuthMode>("menu")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeField, setActiveField] = useState<InputField>("email")
    
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [otp, setOtp] = useState("")
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const menuOptions = ["Login", "Register"]
    const loginFields: InputField[] = ["email"]
    const registerFields: InputField[] = ["name", "email"]

    useInput(async (input, key) => {
        if (loading) return

        // Menu mode
        if (mode === "menu") {
            if (key.upArrow) {
                setSelectedIndex(prev => prev > 0 ? prev - 1 : menuOptions.length - 1)
            } else if (key.downArrow) {
                setSelectedIndex(prev => prev < menuOptions.length - 1 ? prev + 1 : 0)
            } else if (key.return) {
                if (selectedIndex === 0) {
                    setMode("login")
                    setActiveField("email")
                } else {
                    setMode("register")
                    setActiveField("name")
                }
                setError("")
                setMessage("")
            }
            return
        }

        // OTP mode
        if (mode === "otp") {
            if (key.return && otp.length === 6) {
                setLoading(true)
                setError("")
                try {
                    const result = await mockBackendAPI.verifyOTP(email, otp)
                    if (result.success) {
                        setMessage(result.message)
                        setTimeout(() => onAuthenticated(), 1000)
                    } else {
                        setError(result.message)
                        setOtp("")
                    }
                } catch (err) {
                    setError("Terjadi kesalahan koneksi")
                } finally {
                    setLoading(false)
                }
            } else if (key.backspace || key.delete) {
                setOtp(prev => prev.slice(0, -1))
            } else if (input && /^\d$/.test(input) && otp.length < 6) {
                setOtp(prev => prev + input)
            } else if (key.escape) {
                setMode("menu")
                setOtp("")
                setEmail("")
                setName("")
                setError("")
                setMessage("")
            }
            return
        }

        // Login/Register mode
        const fields = mode === "login" ? loginFields : registerFields
        
        if (key.tab || key.downArrow) {
            const currentIndex = fields.indexOf(activeField)
            const nextIndex = (currentIndex + 1) % fields.length
            setActiveField(fields[nextIndex])
        } else if (key.upArrow) {
            const currentIndex = fields.indexOf(activeField)
            const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1
            setActiveField(fields[prevIndex])
        } else if (key.return) {
            // Submit form
            if (mode === "login" && email) {
                setLoading(true)
                setError("")
                try {
                    const result = await mockBackendAPI.login(email)
                    if (result.success) {
                        setMessage(result.message)
                        setMode("otp")
                        setOtp("")
                    } else {
                        setError("Login gagal")
                    }
                } catch (err) {
                    setError("Terjadi kesalahan koneksi")
                } finally {
                    setLoading(false)
                }
            } else if (mode === "register" && email && name) {
                setLoading(true)
                setError("")
                try {
                    const result = await mockBackendAPI.register(email, name)
                    if (result.success) {
                        setMessage(result.message)
                        setMode("otp")
                        setOtp("")
                    } else {
                        setError("Registrasi gagal")
                    }
                } catch (err) {
                    setError("Terjadi kesalahan koneksi")
                } finally {
                    setLoading(false)
                }
            }
        } else if (key.escape) {
            setMode("menu")
            setEmail("")
            setName("")
            setError("")
            setMessage("")
        } else if (key.backspace || key.delete) {
            if (activeField === "email") {
                setEmail(prev => prev.slice(0, -1))
            } else if (activeField === "name") {
                setName(prev => prev.slice(0, -1))
            }
        } else if (input && input.length === 1) {
            if (activeField === "email") {
                setEmail(prev => prev + input)
            } else if (activeField === "name") {
                setName(prev => prev + input)
            }
        }
    })

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
                <Text bold color="cyan">RacerFS Authentication</Text>
            </Box>

            {mode === "menu" && (
                <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
                    <Text bold color="yellow" marginBottom={1}>Pilih Mode Autentikasi</Text>
                    {menuOptions.map((option, index) => (
                        <Box key={option}>
                            <Text color={index === selectedIndex ? "green" : "white"}>
                                {index === selectedIndex ? "▶ " : "  "}
                                {option}
                            </Text>
                        </Box>
                    ))}
                    <Box marginTop={1}>
                        <Text dimColor>↑/↓ untuk navigasi, Enter untuk pilih</Text>
                    </Box>
                </Box>
            )}

            {(mode === "login" || mode === "register") && (
                <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
                    <Text bold color="yellow" marginBottom={1}>
                        {mode === "login" ? "Login" : "Register"}
                    </Text>

                    {mode === "register" && (
                        <Box marginBottom={1}>
                            <Text color={activeField === "name" ? "green" : "white"}>
                                {activeField === "name" ? "▶ " : "  "}Nama: {name}
                                {activeField === "name" && <Text color="green">_</Text>}
                            </Text>
                        </Box>
                    )}

                    <Box marginBottom={1}>
                        <Text color={activeField === "email" ? "green" : "white"}>
                            {activeField === "email" ? "▶ " : "  "}Email: {email}
                            {activeField === "email" && <Text color="green">_</Text>}
                        </Text>
                    </Box>

                    {loading && (
                        <Box marginTop={1}>
                            <Text color="cyan">Loading...</Text>
                        </Box>
                    )}

                    {error && (
                        <Box marginTop={1}>
                            <Text color="red">{error}</Text>
                        </Box>
                    )}

                    {message && (
                        <Box marginTop={1}>
                            <Text color="green">{message}</Text>
                        </Box>
                    )}

                    <Box marginTop={1}>
                        <Text dimColor>Tab/↑/↓ untuk pindah field, Enter untuk submit, Esc untuk kembali</Text>
                    </Box>
                </Box>
            )}

            {mode === "otp" && (
                <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
                    <Text bold color="yellow" marginBottom={1}>Verifikasi OTP</Text>
                    <Text color="white" marginBottom={1}>
                        Masukkan kode 6 digit yang dikirim ke {email}
                    </Text>

                    <Box marginBottom={1}>
                        <Text color="cyan">
                            Kode OTP: {otp.split("").map((digit, i) => (
                                <Text key={i} color="green">{digit} </Text>
                            ))}
                            {otp.length < 6 && <Text color="green">_</Text>}
                        </Text>
                    </Box>

                    {loading && (
                        <Box marginTop={1}>
                            <Text color="cyan">Memverifikasi...</Text>
                        </Box>
                    )}

                    {error && (
                        <Box marginTop={1}>
                            <Text color="red">{error}</Text>
                        </Box>
                    )}

                    {message && (
                        <Box marginTop={1}>
                            <Text color="green">{message}</Text>
                        </Box>
                    )}

                    <Box marginTop={1}>
                        <Text dimColor>Ketik 6 digit angka, Enter untuk verifikasi, Esc untuk kembali</Text>
                    </Box>
                    <Box marginTop={1}>
                        <Text dimColor color="yellow">Hint: Gunakan kode 123456 untuk testing</Text>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

const Dashboard = () => {
    const [time, setTime] = useState(new Date())
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    const options = [
        "View System Logs",
        "Manage Services",
        "Configure Settings",
        "Run Diagnostics",
        "Exit Dashboard"
    ]

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
        } else if (key.downArrow) {
            setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
        } else if (key.return) {
            setSelectedOption(options[selectedIndex])
        }
    })

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const stats = {
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        activeProcesses: Math.floor(Math.random() * 50) + 10
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
                <Text bold color="cyan">RacerFS Dashboard</Text>
            </Box>

            <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1} marginBottom={1}>
                <Text bold color="yellow">System Time</Text>
                <Text color="white">{time.toLocaleString()}</Text>
            </Box>

            <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1} marginBottom={1}>
                <Text bold color="yellow">System Statistics</Text>
                <Box flexDirection="column" paddingLeft={1}>
                    <Text>
                        <Text color="green">CPU Usage:</Text> {stats.cpuUsage}%
                    </Text>
                    <Text>
                        <Text color="magenta">Memory Usage:</Text> {stats.memoryUsage}%
                    </Text>
                    <Text>
                        <Text color="cyan">Active Processes:</Text> {stats.activeProcesses}
                    </Text>
                </Box>
            </Box>

            <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1} marginBottom={1}>
                <Text bold color="yellow">Select an Action</Text>
                <Box flexDirection="column" paddingLeft={1} paddingTop={1}>
                    {options.map((option, index) => (
                        <Box key={option}>
                            <Text color={index === selectedIndex ? "green" : "white"}>
                                {index === selectedIndex ? "▶ " : "  "}
                                {option}
                            </Text>
                        </Box>
                    ))}
                </Box>
                {selectedOption && (
                    <Box marginTop={1} paddingLeft={1}>
                        <Text color="cyan">Selected: {selectedOption}</Text>
                    </Box>
                )}
            </Box>

            <Box borderStyle="round" borderColor="gray" padding={1}>
                <Text dimColor>Use ↑/↓ arrows to navigate, Enter to select • Ctrl+C to exit</Text>
            </Box>
        </Box>
    )
}

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    return isAuthenticated ? (
        <Dashboard />
    ) : (
        <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
    )
}

render(<App />)