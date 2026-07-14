import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, Text, Box, useInput } from "ink";
import { useState, useEffect } from "react";
// Mock Backend API
const mockBackendAPI = {
    login: async (email) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            message: "OTP berhasil dikirim ke email Anda"
        };
    },
    register: async (email, name) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            message: "OTP berhasil dikirim ke email Anda untuk verifikasi"
        };
    },
    verifyOTP: async (email, otp) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (otp === "123456") {
            return {
                success: true,
                message: "Login berhasil!",
                token: "mock-jwt-token-123"
            };
        }
        return {
            success: false,
            message: "Kode OTP salah atau sudah kadaluarsa"
        };
    }
};
const AuthScreen = ({ onAuthenticated }) => {
    const [mode, setMode] = useState("menu");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeField, setActiveField] = useState("email");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const menuOptions = ["Login", "Register"];
    const loginFields = ["email"];
    const registerFields = ["name", "email"];
    useInput(async (input, key) => {
        if (loading)
            return;
        // Menu mode
        if (mode === "menu") {
            if (key.upArrow) {
                setSelectedIndex(prev => prev > 0 ? prev - 1 : menuOptions.length - 1);
            }
            else if (key.downArrow) {
                setSelectedIndex(prev => prev < menuOptions.length - 1 ? prev + 1 : 0);
            }
            else if (key.return) {
                if (selectedIndex === 0) {
                    setMode("login");
                    setActiveField("email");
                }
                else {
                    setMode("register");
                    setActiveField("name");
                }
                setError("");
                setMessage("");
            }
            return;
        }
        // OTP mode
        if (mode === "otp") {
            if (key.return && otp.length === 6) {
                setLoading(true);
                setError("");
                try {
                    const result = await mockBackendAPI.verifyOTP(email, otp);
                    if (result.success) {
                        setMessage(result.message);
                        setTimeout(() => onAuthenticated(), 1000);
                    }
                    else {
                        setError(result.message);
                        setOtp("");
                    }
                }
                catch (err) {
                    setError("Terjadi kesalahan koneksi");
                }
                finally {
                    setLoading(false);
                }
            }
            else if (key.backspace || key.delete) {
                setOtp(prev => prev.slice(0, -1));
            }
            else if (input && /^\d$/.test(input) && otp.length < 6) {
                setOtp(prev => prev + input);
            }
            else if (key.escape) {
                setMode("menu");
                setOtp("");
                setEmail("");
                setName("");
                setError("");
                setMessage("");
            }
            return;
        }
        // Login/Register mode
        const fields = mode === "login" ? loginFields : registerFields;
        if (key.tab || key.downArrow) {
            const currentIndex = fields.indexOf(activeField);
            const nextIndex = (currentIndex + 1) % fields.length;
            setActiveField(fields[nextIndex]);
        }
        else if (key.upArrow) {
            const currentIndex = fields.indexOf(activeField);
            const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1;
            setActiveField(fields[prevIndex]);
        }
        else if (key.return) {
            // Submit form
            if (mode === "login" && email) {
                setLoading(true);
                setError("");
                try {
                    const result = await mockBackendAPI.login(email);
                    if (result.success) {
                        setMessage(result.message);
                        setMode("otp");
                        setOtp("");
                    }
                    else {
                        setError("Login gagal");
                    }
                }
                catch (err) {
                    setError("Terjadi kesalahan koneksi");
                }
                finally {
                    setLoading(false);
                }
            }
            else if (mode === "register" && email && name) {
                setLoading(true);
                setError("");
                try {
                    const result = await mockBackendAPI.register(email, name);
                    if (result.success) {
                        setMessage(result.message);
                        setMode("otp");
                        setOtp("");
                    }
                    else {
                        setError("Registrasi gagal");
                    }
                }
                catch (err) {
                    setError("Terjadi kesalahan koneksi");
                }
                finally {
                    setLoading(false);
                }
            }
        }
        else if (key.escape) {
            setMode("menu");
            setEmail("");
            setName("");
            setError("");
            setMessage("");
        }
        else if (key.backspace || key.delete) {
            if (activeField === "email") {
                setEmail(prev => prev.slice(0, -1));
            }
            else if (activeField === "name") {
                setName(prev => prev.slice(0, -1));
            }
        }
        else if (input && input.length === 1) {
            if (activeField === "email") {
                setEmail(prev => prev + input);
            }
            else if (activeField === "name") {
                setName(prev => prev + input);
            }
        }
    });
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "RacerFS Authentication" }) }), mode === "menu" && (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "magenta", padding: 1, children: [_jsx(Text, { bold: true, color: "yellow", marginBottom: 1, children: "Pilih Mode Autentikasi" }), menuOptions.map((option, index) => (_jsx(Box, { children: _jsxs(Text, { color: index === selectedIndex ? "green" : "white", children: [index === selectedIndex ? "▶ " : "  ", option] }) }, option))), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "\u2191/\u2193 untuk navigasi, Enter untuk pilih" }) })] })), (mode === "login" || mode === "register") && (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, children: [_jsx(Text, { bold: true, color: "yellow", marginBottom: 1, children: mode === "login" ? "Login" : "Register" }), mode === "register" && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: activeField === "name" ? "green" : "white", children: [activeField === "name" ? "▶ " : "  ", "Nama: ", name, activeField === "name" && _jsx(Text, { color: "green", children: "_" })] }) })), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: activeField === "email" ? "green" : "white", children: [activeField === "email" ? "▶ " : "  ", "Email: ", email, activeField === "email" && _jsx(Text, { color: "green", children: "_" })] }) }), loading && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "cyan", children: "Loading..." }) })), error && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "red", children: error }) })), message && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "green", children: message }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Tab/\u2191/\u2193 untuk pindah field, Enter untuk submit, Esc untuk kembali" }) })] })), mode === "otp" && (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, children: [_jsx(Text, { bold: true, color: "yellow", marginBottom: 1, children: "Verifikasi OTP" }), _jsxs(Text, { color: "white", marginBottom: 1, children: ["Masukkan kode 6 digit yang dikirim ke ", email] }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: "cyan", children: ["Kode OTP: ", otp.split("").map((digit, i) => (_jsxs(Text, { color: "green", children: [digit, " "] }, i))), otp.length < 6 && _jsx(Text, { color: "green", children: "_" })] }) }), loading && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "cyan", children: "Memverifikasi..." }) })), error && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "red", children: error }) })), message && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "green", children: message }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Ketik 6 digit angka, Enter untuk verifikasi, Esc untuk kembali" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, color: "yellow", children: "Hint: Gunakan kode 123456 untuk testing" }) })] }))] }));
};
const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        "View System Logs",
        "Manage Services",
        "Configure Settings",
        "Run Diagnostics",
        "Exit Dashboard"
    ];
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        else if (key.downArrow) {
            setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        else if (key.return) {
            setSelectedOption(options[selectedIndex]);
        }
    });
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const stats = {
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        activeProcesses: Math.floor(Math.random() * 50) + 10
    };
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "RacerFS Dashboard" }) }), _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, marginBottom: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "System Time" }), _jsx(Text, { color: "white", children: time.toLocaleString() })] }), _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "System Statistics" }), _jsxs(Box, { flexDirection: "column", paddingLeft: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "green", children: "CPU Usage:" }), " ", stats.cpuUsage, "%"] }), _jsxs(Text, { children: [_jsx(Text, { color: "magenta", children: "Memory Usage:" }), " ", stats.memoryUsage, "%"] }), _jsxs(Text, { children: [_jsx(Text, { color: "cyan", children: "Active Processes:" }), " ", stats.activeProcesses] })] })] }), _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "magenta", padding: 1, marginBottom: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "Select an Action" }), _jsx(Box, { flexDirection: "column", paddingLeft: 1, paddingTop: 1, children: options.map((option, index) => (_jsx(Box, { children: _jsxs(Text, { color: index === selectedIndex ? "green" : "white", children: [index === selectedIndex ? "▶ " : "  ", option] }) }, option))) }), selectedOption && (_jsx(Box, { marginTop: 1, paddingLeft: 1, children: _jsxs(Text, { color: "cyan", children: ["Selected: ", selectedOption] }) }))] }), _jsx(Box, { borderStyle: "round", borderColor: "gray", padding: 1, children: _jsx(Text, { dimColor: true, children: "Use \u2191/\u2193 arrows to navigate, Enter to select \u2022 Ctrl+C to exit" }) })] }));
};
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    return isAuthenticated ? (_jsx(Dashboard, {})) : (_jsx(AuthScreen, { onAuthenticated: () => setIsAuthenticated(true) }));
};
render(_jsx(App, {}));
//# sourceMappingURL=main.js.map