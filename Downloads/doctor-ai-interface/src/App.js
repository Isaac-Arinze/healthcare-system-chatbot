import React, { useState, useEffect, useRef } from "react";

// Generate a simple UUID without external dependency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App = () => {
  // Session Management - Best Practice
  const [sessionId] = useState(() => generateUUID()); // Persistent session ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Session State Management
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes default
  
  // Application State
  const [patientId, setPatientId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [workflowType, setWorkflowType] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [isInitialPrompt, setIsInitialPrompt] = useState(true);
  const [patientDataLoaded, setPatientDataLoaded] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const authTokenRef = useRef(null);
  const patientIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionTimeoutRef = useRef(null);

  // AI Response Formatting Function
  const formatAIResponse = (text) => {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Remove all asterisks used for markdown formatting
    let formatted = text.replace(/\*+/g, '');
    
    // Clean up extra spaces that might be left after removing asterisks
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Clean up multiple line breaks (keep maximum of 2)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    formatted = formatted.trim();
    
    return formatted;
  };

  // Session Management Functions
  const startSession = () => {
    const now = new Date();
    setSessionActive(true);
    setSessionStartTime(now);
    setLastActivity(now);
    
    // Clear any existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, sessionTimeout);
    
    console.log(`🟢 Session started: ${sessionId} at ${now.toLocaleTimeString()}`);
  };

  const updateActivity = () => {
    const now = new Date();
    setLastActivity(now);
    
    // Reset timeout on activity
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, sessionTimeout);
  };

  const handleSessionTimeout = () => {
    setSessionActive(false);
    setIsEnabled(false);
    
    const timeoutMessage = {
      sender: "system",
      text: "⏰ Session expired due to inactivity. Please re-enable the AI assistant to continue.",
      timestamp: new Date().toLocaleTimeString(),
      type: "session_timeout"
    };
    
    setMessages(prev => [...prev, timeoutMessage]);
    console.log(`🔴 Session expired: ${sessionId}`);
  };

  const endSession = () => {
    setSessionActive(false);
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    console.log(`🔴 Session ended: ${sessionId}`);
  };

  const resetSession = () => {
    // Clear conversation but keep session ID
    setMessages([]);
    setIsInitialPrompt(true);
    setPatientDataLoaded(false);
    setInput("");
    
    const resetMessage = {
      sender: "system",
      text: "🔄 Session reset. Previous conversation cleared.",
      timestamp: new Date().toLocaleTimeString(),
      type: "session_reset"
    };
    
    setMessages([resetMessage]);
    updateActivity();
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle modal open/close with session management
  const handleModalOpen = () => {
    setIsModalOpen(true);
    if (sessionActive) {
      updateActivity(); // Update activity if session is active
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Session continues running in background
    // Only update activity, don't end session
    if (sessionActive) {
      updateActivity();
    }
  };

  // Handle enable/disable with session management
  const handleToggleEnable = (enabled) => {
    setIsEnabled(enabled);
    
    if (enabled) {
      startSession();
    } else {
      endSession();
    }
  };

  // Input change handlers with activity tracking
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (sessionActive) updateActivity();
  };

  const handleAuthTokenChange = (e) => {
    setAuthToken(e.target.value);
    if (sessionActive) updateActivity();
  };

  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
    setPatientDataLoaded(false);
    setIsInitialPrompt(true);
    if (sessionActive) updateActivity();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!sessionActive) {
      alert("Session is not active. Please enable the AI assistant first.");
      return;
    }

    if (!patientId.trim()) {
      alert("Please enter a Patient ID first!");
      return;
    }
           
    if (!authToken.trim()) {
      alert("Please enter an authorization token first!");
      return;
    }

    if (workflowType === "consultation" && !input.trim()) {
      alert("Please enter a message for consultation!");
      return;
    }

    updateActivity(); 
    setLoading(true);

    const messageText = workflowType === "summary"
      ? (input || "Get patient summary")
      : input;

    const userMessage = {
      sender: "doctor",
      text: messageText,
      timestamp: new Date().toLocaleTimeString(),
      sessionId: sessionId
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const endpoint = workflowType === "summary"
        ? "https://n8n.flexipgroup.com/webhook/patient-summary"
        : "https://n8n.flexipgroup.com/webhook/consultation";

      let payload;
           
      if (workflowType === "summary") {
        payload = {
          patient_id: patientId.trim(),
          session_id: sessionId
        };
      } else {
        payload = {
          patient_id: patientId.trim(),
          message: messageText,
          session_id: sessionId,
          initial_prompt: isInitialPrompt,
          conversation_context: {
            patient_data_loaded: patientDataLoaded,
            message_count: messages.length,
            workflow_type: workflowType,
            session_start_time: sessionStartTime,
            timestamp: new Date().toISOString()
          }
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
          'X-Session-ID': sessionId
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
                 
      let responseText = "";
                 
      if (data) {
        if (typeof data === 'string') {
          responseText = data;
        } else if (data.output) {
          responseText = data.output;
        } else if (data.text) {
          responseText = data.text;
        } else if (data.response) {
          responseText = data.response;
        } else if (data.message) {
          responseText = data.message;
        } else {
          responseText = JSON.stringify(data, null, 2);
        }
      }
                 
      if (!responseText || responseText.trim() === '') {
        responseText = "Received empty response from server";
      }

      // Apply formatting to AI response
      const formattedResponse = formatAIResponse(responseText);

      const aiMessage = {
        sender: "ai",
        text: formattedResponse, // Use formatted response
        timestamp: new Date().toLocaleTimeString(),
        sessionId: sessionId
      };
           
      setMessages((prev) => [...prev, aiMessage]);

      if (workflowType === "consultation") {
        if (isInitialPrompt) {
          setIsInitialPrompt(false);
          setPatientDataLoaded(true);
        }
      }

    } catch (error) {
      let errorText = "Error contacting AI service.";
           
      if (error.message.includes('401')) {
        errorText = "Authentication failed. Please check your authorization token.";
      } else if (error.message.includes('403')) {
        errorText = "Access forbidden. You may not have permission to access this patient's data.";
      } else if (error.message.includes('404')) {
        errorText = "Patient not found. Please verify the Patient ID.";
      } else if (error.message.includes('500')) {
        errorText = "Server error. The medical AI service is temporarily unavailable.";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorText = "Network Error: Unable to reach the medical AI service. Please check your connection.";
      } else {
        errorText = `Request Error: ${error.message}`;
      }
                 
      const errorMessage = {
        sender: "ai",
        text: errorText,
        timestamp: new Date().toLocaleTimeString(),
        type: "error",
        sessionId: sessionId
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      updateActivity();
    }
  };

  const testConnection = async () => {
    if (!sessionActive) {
      alert("Session is not active. Please enable the AI assistant first.");
      return;
    }

    if (!authToken.trim()) {
      const errorMessage = {
        sender: "ai",
        text: "Please enter an authorization token first!",
        timestamp: new Date().toLocaleTimeString(),
        type: "error"
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    updateActivity();
    setLoading(true);
    
    try {
      const response = await fetch("https://n8n.flexipgroup.com/webhook/patient-summary/test", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          patient_id: "8af2365a-bbd2-41db-9843-ee0a2b6ff756",
          session_id: sessionId
        })
      });
                 
      const responseText = await response.text();
                 
      // Apply formatting to test response as well
      const formattedTestResponse = formatAIResponse(responseText);

      const testMessage = {
        sender: "ai",
        text: `🔧 Connection Test Result:\n\nStatus: ${response.status} ${response.status === 200 ? '✅ Success' : '❌ Failed'}\n\nResponse Preview:\n${formattedTestResponse.substring(0, 200)}${formattedTestResponse.length > 200 ? '...' : ''}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "test_result",
        sessionId: sessionId
      };
      setMessages((prev) => [...prev, testMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "ai",
        text: `🔧 Connection Test Failed:\n\nError: ${error.message}\n\nPlease check:\n• Your authorization token\n• Network connection\n• API endpoint availability`,
        timestamp: new Date().toLocaleTimeString(),
        type: "test_error",
        sessionId: sessionId
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      updateActivity();
    }
  };

  const quickActions = [
    { label: "Reason for Visit", prompt: "What is the reason for this patient's visit and current chief complaint?" },
    { label: "Diagnosis & Assessment", prompt: "Based on the available data, what is your clinical assessment and potential diagnosis for this patient?" },
    { label: "Current Medications", prompt: "What medications is this patient currently taking and are there any concerns?" },
    { label: "Recent Lab Results", prompt: "What are the most recent laboratory and test results for this patient?" },
    { label: "Vital Signs Trend", prompt: "Show me the trend in this patient's vital signs and any concerning patterns." },
    { label: "Treatment Plan", prompt: "What treatment recommendations do you suggest based on this patient's condition?" }
  ];

  const handleQuickAction = (prompt) => {
    if (!sessionActive) {
      alert("Session is not active. Please enable the AI assistant first.");
      return;
    }
    setInput(prompt);
    inputRef.current?.focus();
    updateActivity();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f5f5f5",
      position: "relative" 
    }}>
      {/* Chat Avatar - Fixed position at bottom right */}
      <div
        onClick={handleModalOpen}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          backgroundColor: sessionActive ? "#28a745" : "#007bff",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: sessionActive 
            ? "0 4px 12px rgba(40,167,69,0.3)" 
            : "0 4px 12px rgba(0,123,255,0.3)",
          zIndex: 1000,
          transition: "all 0.3s ease",
          fontSize: 24,
          border: sessionActive ? "3px solid #155724" : "none"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = sessionActive 
            ? "0 6px 16px rgba(40,167,69,0.4)" 
            : "0 6px 16px rgba(0,123,255,0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = sessionActive 
            ? "0 4px 12px rgba(40,167,69,0.3)" 
            : "0 4px 12px rgba(0,123,255,0.3)";
        }}
      >
        🏥
      </div>

      {/* Session Status Indicator */}
      {sessionActive && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          backgroundColor: "#28a745",
          color: "white",
          padding: "5px 10px",
          borderRadius: 15,
          fontSize: 12,
          fontWeight: "bold",
          zIndex: 999,
          boxShadow: "0 2px 8px rgba(40,167,69,0.3)"
        }}>
          Session Active
        </div>
      )}

      {/* Welcome Content */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 20
      }}>
        <div style={{
          textAlign: "center",
          maxWidth: 600,
          padding: 40,
          backgroundColor: "white",
          borderRadius: 15,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🏥</div>
          <h1 style={{ 
            color: "#2c3e50", 
            marginBottom: 15,
            fontSize: 36,
            fontWeight: 600 
          }}>
            Welcome to Flexi-AI Assistant
          </h1>
          <p style={{ 
            color: "#7f8c8d", 
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 30 
          }}>
            Your advanced medical consultation and patient summary system. 
            Click the chat icon in the bottom-right corner to get started.
          </p>
          
          {/* Session Info */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #dee2e6"
          }}>
            <div style={{ fontSize: 14, color: "#6c757d", marginBottom: 5 }}>
              Session ID: <code style={{ backgroundColor: "#e9ecef", padding: "2px 6px", borderRadius: 3 }}>
                {sessionId.substring(0, 8)}...
              </code>
            </div>
            <div style={{ fontSize: 14, color: "#6c757d" }}>
              Status: <span style={{ 
                color: sessionActive ? "#28a745" : "#6c757d",
                fontWeight: "bold"
              }}>
                {sessionActive ? "🟢 Active" : "⚪ Inactive"}
              </span>
            </div>
            {sessionStartTime && (
              <div style={{ fontSize: 12, color: "#6c757d", marginTop: 5 }}>
                Started: {sessionStartTime.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 30,
            marginTop: 30
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <h3 style={{ color: "#2c3e50", marginBottom: 5 }}>Patient Summary</h3>
              <p style={{ color: "#7f8c8d", fontSize: 14 }}>Get comprehensive patient overviews</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
              <h3 style={{ color: "#2c3e50", marginBottom: 5 }}>AI Consultation</h3>
              <p style={{ color: "#7f8c8d", fontSize: 14 }}>Interactive medical consultations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            maxWidth: workflowType === "consultation" ? 1000 : 700,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: 10,
            padding: 25,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            position: "relative"
          }}>
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              style={{
                position: "absolute",
                top: 15,
                right: 15,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#666",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              ×
            </button>

            <h1 style={{
              color: "#2c3e50",
              marginBottom: 5,
              fontSize: 28,
              fontWeight: 600
            }}>
              🏥 Flexi-AI Assistant
            </h1>
            <p style={{
              color: "#7f8c8d",
              marginBottom: 20,
              fontSize: 14
            }}>
              Advanced medical consultation and patient summary system
            </p>

            {/* Session Status Bar */}
            <div style={{
              marginBottom: 20,
              padding: 10,
              backgroundColor: sessionActive ? "#d4edda" : "#f8d7da",
              borderRadius: 8,
              border: `1px solid ${sessionActive ? "#c3e6cb" : "#f5c6cb"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12
            }}>
              <div>
                <strong>Session:</strong> {sessionId.substring(0, 13)}... | 
                <strong> Status:</strong> {sessionActive ? "🟢 Active" : "🔴 Inactive"}
                {lastActivity && (
                  <span> | <strong>Last Activity:</strong> {lastActivity.toLocaleTimeString()}</span>
                )}
              </div>
              <button
                onClick={resetSession}
                disabled={!sessionActive}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  backgroundColor: sessionActive ? "#ffc107" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: sessionActive ? "pointer" : "not-allowed"
                }}
              >
                Reset
              </button>
            </div>

            {/* Toggle Switch */}
            <div style={{
              marginBottom: 20,
              padding: 15,
              backgroundColor: isEnabled ? "#d4edda" : "#f8d7da",
              borderRadius: 8,
              border: `1px solid ${isEnabled ? "#c3e6cb" : "#f5c6cb"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  color: isEnabled ? "#155724" : "#721c24",
                  marginBottom: 5
                }}>
                  AI Assistant Status: {isEnabled ? "🟢 ENABLED" : "🔴 DISABLED"}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: isEnabled ? "#155724" : "#721c24"
                }}>
                  {isEnabled ? "AI features are active and ready to use" : "AI features are disabled for safety"}
                </div>
              </div>
              <label style={{
                position: "relative",
                display: "inline-block",
                width: 80,
                height: 34,
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => handleToggleEnable(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isEnabled ? "#28a745" : "#ccc",
                  borderRadius: 34,
                  transition: "0.4s",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isEnabled ? "flex-start" : "center",
                  paddingLeft: isEnabled ? "8px" : "0",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                }}>
                  {isEnabled ? "Active" : "Off"}
                  <span style={{
                    position: "absolute",
                    content: "",
                    height: 26,
                    width: 26,
                    left: isEnabled ? 50 : 4,
                    bottom: 4,
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.4s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }} />
                </span>
              </label>
            </div>

            {/* Workflow Selection */}
            <div style={{
              marginBottom: 20,
              padding: 15,
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              border: "1px solid #dee2e6",
              opacity: isEnabled ? 1 : 0.5
            }}>
              <div style={{ marginBottom: 10, fontWeight: 600, color: "#0c5460" }}>
                Select Workflow Mode:
              </div>
              <label style={{
                marginRight: 25,
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                cursor: isEnabled ? "pointer" : "not-allowed"
              }}>
                <input
                  type="radio"
                  value="summary"
                  checked={workflowType === "summary"}
                  onChange={(e) => {
                    if (!isEnabled) return;
                    setWorkflowType(e.target.value);
                    setMessages([]);
                    setIsInitialPrompt(true);
                    setPatientDataLoaded(false);
                    updateActivity();
                  }}
                  disabled={!isEnabled}
                  style={{ marginRight: 8 }}
                />
                <span>
                  <strong>📋 Patient Summary</strong>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    Get comprehensive patient overview
                  </div>
                </span>
              </label>
              <label style={{
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                cursor: isEnabled ? "pointer" : "not-allowed"
              }}>
                <input
                  type="radio"
                  value="consultation"
                  checked={workflowType === "consultation"}
                  onChange={(e) => {
                    if (!isEnabled) return;
                    setWorkflowType(e.target.value);
                    setMessages([]);
                    setIsInitialPrompt(true);
                    setPatientDataLoaded(false);
                    updateActivity();
                  }}
                  disabled={!isEnabled}
                  style={{ marginRight: 8 }}
                />
                <span>
                  <strong>💬 Interactive Consultation</strong>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    AI-powered consultation with medical knowledge
                  </div>
                </span>
              </label>
            </div>

            {/* Authorization Token */}
            <div style={{ marginBottom: 15 }}>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#2c3e50",
                opacity: isEnabled ? 1 : 0.5
              }}>
                🔐 Authorization Token:
              </label>
              <input
                ref={authTokenRef}
                type="password"
                placeholder="Enter your Bearer token or JWT token"
                value={authToken}
                onChange={handleAuthTokenChange}
                disabled={!isEnabled}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #dee2e6",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  color: "#495057",
                  backgroundColor: isEnabled ? "#fff" : "#f8f9fa",
                  opacity: isEnabled ? 1 : 0.6,
                  cursor: isEnabled ? "text" : "not-allowed"
                }}
                onKeyPress={handleKeyPress}
              />
            </div>
        
            {/* Patient ID */}
            <div style={{ marginBottom: 15 }}>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#2c3e50",
                opacity: isEnabled ? 1 : 0.5
              }}>
                🏥 Patient ID:
              </label>
              <input
                ref={patientIdRef}
                // placeholder="Enter Patient ID (e.g., e8b40ce7-bf
                placeholder="Enter Patient ID (e.g., e8b40ce7-bfbc-4dff-b5e9-08a680947a4e)"
                value={patientId}
                onChange={handlePatientIdChange}
                disabled={!isEnabled}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #dee2e6",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  color: "#495057",
                  backgroundColor: isEnabled ? "#fff" : "#f8f9fa",
                  opacity: isEnabled ? 1 : 0.6,
                  cursor: isEnabled ? "text" : "not-allowed"
                }}
                onKeyPress={handleKeyPress}
              />
            </div>
        
            {/* Messages */}
            <div style={{
              height: 300,
              overflowY: "scroll",
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              opacity: isEnabled ? 1 : 0.5
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  textAlign: msg.sender === "ai" || msg.sender === "system" ? "left" : "right", 
                  marginBottom: 10 
                }}>
                  <div style={{
                    display: "inline-block",
                    maxWidth: "80%",
                    padding: "10px 15px",
                    borderRadius: 15,
                    backgroundColor: msg.sender === "ai" ? "#e3f2fd" : 
                                   msg.sender === "system" ? "#fff3cd" : "#e8f5e8",
                    border: msg.sender === "ai" ? "1px solid #bbdefb" : 
                           msg.sender === "system" ? "1px solid #ffeaa7" : "1px solid #c8e6c9",
                    wordWrap: "break-word"
                  }}>
                    <p style={{ margin: 0 }}>
                      <strong>
                        {msg.sender === "ai" ? "Flexi" : 
                         msg.sender === "system" ? "System" : "Doc"}:
                      </strong> {msg.text}
                    </p>
                    {msg.timestamp && (
                      <div style={{ 
                        fontSize: 10, 
                        color: "#666", 
                        marginTop: 5,
                        textAlign: "right" 
                      }}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ textAlign: "center", padding: 10 }}>
                  <div style={{ 
                    display: "inline-block",
                    padding: "10px 20px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: 20,
                    border: "1px solid #dee2e6"
                  }}>
                    🤔 Flexi is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
        
            {/* Input and Send Button */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={workflowType === "summary" ? "Optional: Add a note..." : "Type your message..."}
                disabled={!isEnabled || loading}
                style={{
                  flex: 1,
                  padding: 12,
                  border: "2px solid #dee2e6",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  color: "#495057",
                  backgroundColor: isEnabled ? "#fff" : "#f8f9fa",
                  opacity: isEnabled ? 1 : 0.6,
                  cursor: isEnabled ? "text" : "not-allowed"
                }}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={sendMessage} 
                disabled={!isEnabled || loading}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: isEnabled && !loading ? "#28a745" : "#6c757d", 
                  color: "white", 
                  border: "none",
                  borderRadius: 6,
                  cursor: isEnabled && !loading ? "pointer" : "not-allowed",
                  opacity: isEnabled ? 1 : 0.6,
                  minWidth: 100
                }}
              >
                {loading ? "..." : workflowType === "summary" ? "Get Summary" : "Send"}
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 10,
              opacity: isEnabled ? 1 : 0.5
            }}>
              {quickActions.map((action, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleQuickAction(action.prompt)} 
                  disabled={!isEnabled || loading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isEnabled && !loading ? "#007bff" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: isEnabled && !loading ? "pointer" : "not-allowed",
                    transition: "background-color 0.3s ease",
                    opacity: isEnabled ? 1 : 0.6
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Test Connection */}
            <button 
              onClick={testConnection} 
              disabled={!isEnabled || loading}
              style={{ 
                width: "100%", 
                padding: 10, 
                backgroundColor: isEnabled && !loading ? "#007bff" : "#6c757d", 
                color: "white", 
                border: "none",
                borderRadius: 6,
                cursor: isEnabled && !loading ? "pointer" : "not-allowed",
                opacity: isEnabled ? 1 : 0.6
              }}
            >
              {loading ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
