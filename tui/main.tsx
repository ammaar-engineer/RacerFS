import { render, Text, Box, useInput } from "ink"
import { useState, useEffect } from "react"

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

render(<Dashboard />)