import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, Text, Box, useInput } from "ink";
import { useState, useEffect } from "react";
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
render(_jsx(Dashboard, {}));
//# sourceMappingURL=main.js.map