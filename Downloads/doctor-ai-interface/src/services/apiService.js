            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Mock data for development/testing
const mockPatientData = {
  patient_id: "P12345",
  demographics: {
    name: "John Doe",
    age: 45,
    gender: "Male",
    date_of_birth: "1978-03-15",
    blood_type: "O+",
    allergies: ["Penicillin", "Shellfish"]
  },
  last_visit: "2024-01-15",
  chief_complaint: "Patient presents with chest pain and shortness of breath that started 2 hours ago. Pain is described as crushing, radiating to left arm. Associated with nausea and diaphoresis.",
  diagnosis: "Acute coronary syndrome, rule out myocardial infarction. Recommend immediate cardiac workup including ECG, cardiac enzymes, and cardiology consultation.",
  vitals: {
    blood_pressure: "150/95 mmHg",
    heart_rate: "102 bpm",
    temperature: "98.6°F",
    respiratory_rate: "22/min",
    oxygen_saturation: "96%",
    bmi: "28.5"
  },
  conditions: [
    {
      name: "Hypertension",
      date_diagnosed: "2018-05-10",
      severity: "Moderate",
      status: "Active"
    },
    {
      name: "Type 2 Diabetes",
      date_diagnosed: "2019-08-20",
      severity: "Mild",
      status: "Active"
    },
    {
      name: "Hyperlipidemia",
      date_diagnosed: "2020-02-14",
      severity: "Moderate",
      status: "Active"
    }
  ],
  medications: [
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      status: 'active',
      prescribed_date: '2019-08-20'
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      status: 'active',
      prescribed_date: '2018-05-10'
    },
    {
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      status: 'active',
      prescribed_date: '2020-02-14'
    },
    {
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      status: 'active',
      prescribed_date: '2020-01-05'
    }
  ],
  lab_results: [
    {
      test_name: 'Complete Blood Count',
      result: 'WBC: 7.2, RBC: 4.5, Hgb: 14.2, Hct: 42%',
      date: '2024-01-10',
      status: 'normal',
      reference_range: 'Within normal limits'
    },
    {
      test_name: 'Basic Metabolic Panel',
      result: 'Glucose: 145, BUN: 18, Creatinine: 1.1',
      date: '2024-01-10',
      status: 'abnormal',
      reference_range: 'Glucose: 70-100 mg/dL'
    },
    {
      test_name: 'Lipid Panel',
      result: 'Total Chol: 220, LDL: 140, HDL: 45, Trig: 180',
      date: '2024-01-05',
      status: 'abnormal',
      reference_range: 'Total Chol: <200 mg/dL'
    },
    {
      test_name: 'Troponin I',
      result: '0.8 ng/mL',
      date: '2024-01-15',
      status: 'abnormal',
      reference_range: '<0.04 ng/mL'
    },
    {
      test_name: 'BNP',
      result: '450 pg/mL',
      date: '2024-01-15',
      status: 'abnormal',
      reference_range: '<100 pg/mL'
    }
  ]
};

class ApiService {
  static async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async sendMessage(message, sessionId) {
    try {
      const response = await this.makeRequest('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: message,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }),
      });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  static async getPatientSummary(patientId, sessionId) {
    try {
      // For development, return mock data after a short delay
      if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          ...mockPatientData,
          patient_id: patientId,
          session_id: sessionId
        };
      }

      // Production API call
      const response = await this.makeRequest(`/patient/${patientId}/summary`, {
        method: 'GET',
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching patient summary:', error);
      throw new Error(`Failed to fetch patient summary: ${error.message}`);
    }
  }

  static async getPatientList() {
    try {
      // Mock patient list - replace with actual API call
      const mockPatients = [
        {
          id: 'P001',
          name: 'John Smith',
          age: 45,
          gender: 'Male',
          lastVisit: '2024-01-15',
          status: 'Active',
          urgency: 'High'
        },
        {
          id: 'P002',
          name: 'Sarah Johnson',
          age: 32,
          gender: 'Female',
          lastVisit: '2024-01-14',
          status: 'Active',
          urgency: 'Normal'
        },
        {
          id: 'P003',
          name: 'Michael Brown',
          age: 58,
          gender: 'Male',
          lastVisit: '2024-01-13',
          status: 'Active',
          urgency: 'High'
        },
        {
          id: 'P004',
          name: 'Emily Davis',
          age: 29,
          gender: 'Female',
          lastVisit: '2024-01-12',
          status: 'Active',
          urgency: 'Normal'
        },
        {
          id: 'P005',
          name: 'Robert Wilson',
          age: 67,
          gender: 'Male',
          lastVisit: '2024-01-11',
          status: 'Active',
          urgency: 'Medium'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPatients;
    } catch (error) {
      throw new Error(`Failed to fetch patient list: ${error.message}`);
    }
  }

  static async createSession() {
    try {
      const response = await this.makeRequest('/session', {
        method: 'POST',
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        }),
      });
      return response.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      // Return a fallback session ID for development
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  static async getSessionHistory(sessionId) {
    try {
      const response = await this.makeRequest(`/session/${sessionId}/history`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching session history:', error);
      throw new Error('Failed to load session history.');
    }
  }

  static async uploadFile(file, sessionId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Session-ID': sessionId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  }

  static async saveConversation(sessionId, conversationData) {
    try {
      const response = await this.makeRequest(`/session/${sessionId}/save`, {
        method: 'POST',
        body: JSON.stringify({
          conversation: conversationData,
          timestamp: new Date().toISOString()
        }),
      });
      return response;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw new Error('Failed to save conversation.');
    }
  }

  static async generateReport(sessionId, reportType = 'summary') {
    try {
      const response = await this.makeRequest(`/session/${sessionId}/report`, {
        method: 'POST',
        body: JSON.stringify({
          report_type: reportType,
          timestamp: new Date().toISOString()
        }),
      });
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report.');
    }
  }
}

export default ApiService;
