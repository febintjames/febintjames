export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'Groq API key not configured' });
    }

    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Rate limiting: max 200 chars per message
        const sanitizedMessage = message.trim().slice(0, 200);

        const SYSTEM_PROMPT = `You are Febin T James's AI portfolio assistant. Be helpful, concise, and friendly. Answer about Febin using this info:

PROFILE: Junior Robotics & AI Engineer at Qmark Technolabs, Kochi, Kerala. AMR Team Lead. B.Tech Computer Science from Providence College of Engineering (2021-2025).

SKILLS: ROS 2 (Humble/Jazzy), Nav2, SLAM, YOLOv8, TensorFlow, OpenCV, MediaPipe, Python, C++, Embedded C, Fusion 360, 3D Printing, ESP32, Arduino, Raspberry Pi 4, Jetson Nano, React, Flutter, Angular, Django, Flask, Streamlit, Gradio, MySQL, Git.

EXPERIENCE:
1. Jr. Robotics & AI Engineer at Qmark Technolabs (Jan 2026-Present) - Leading robotic systems design, ML models, system integration
2. Jr. Robotics & AI Engineer Intern (Paid) at Qmark (Nov 2025-Jan 2026) - Sensors, microcontrollers, computer vision
3. Graduate Robotics Intern at Qmark (June-Nov 2025) - ROS 2, SLAM, 3D modeling, LuQ robot design
4. ML Fundamentals Intern at Keltron (Sep 2023) - ML algorithms, Pandas, NumPy
5. Front-End Dev Intern at NextDigital (Mar 2023) - HTML, CSS, JS, Angular

PROJECTS:
- LuQ Autonomous Delivery Robot (Team Lead) - ROS 2, Nav2, SLAM, ESP32, AprilTag docking, ROSBridge web interface
- 6-Axis Robotic Arm - MicroROS, ESP32, 3D-printed, pick-and-place
- UAE National Day AI Avatar Kiosk - Generative AI, AWS EC2/S3
- Touchless Gesture Control - MediaPipe, OpenCV
- Human Detection & Alert - YOLOv8, auto-capture, email alerts
- AI Chatbot for ROS Devs - Gradio, LLM, Groq, Hugging Face
- Emotion Detection of Infants - TensorFlow, OpenCV, Streamlit
- FlexiSense Smart Glove - ESP32, flex sensors, for deaf/speech impaired
- Smart Curtain System - IoT, ESP32
- Motion-Based Street Light - Arduino, sensors
- Wet & Dry Waste Segregation - IoT, Arduino
- Face Detection using ML - OpenCV, ML

CONTACT: Email: febintj007@gmail.com | Phone: +91 7902871746 | LinkedIn: febin-t-james | GitHub: febintjames

EDUCATION: Plus Two 93%, SSLC 88%. Workshops: Python & Django at Facein (2023, 2024). Achievements: IEEE Xtreme 16.0 & 17.0, Google Cloud Study Jams, GDSC Compose Camp.

Keep responses under 100 words. Use emojis sparingly. If asked to navigate, suggest which section to visit.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: sanitizedMessage }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!groqRes.ok) {
            const errBody = await groqRes.text();
            console.error('Groq API error:', groqRes.status, errBody);
            return res.status(502).json({ error: 'AI service error' });
        }

        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        return res.status(200).json({ reply });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
