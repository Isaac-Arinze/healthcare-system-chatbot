import React, { useState, useEffect } from 'react';
import ApiService from '../services/apiService';

const PatientList = ({ onPatientSelect, sessionId }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Mock patient data - replace with actual API call
      const mockPatients = [
        {
          id: 'P001',
          name: 'John Smith',
          age: 45,
          gender: 'Male',
          lastVisit: '2024-01-15',
          status: 'Active',
          urgency: 'Normal'
        },
        {
          id: 'P002',
          name: 'Sarah Johnson',
          age: 32,
          gender: 'Female',
          lastVisit: '2024-01-14',
          status: 'Active',
          urgency: 'High'
        },
        {
          id: 'P003',
          name: 'Michael Brown',
          age: 67,
          gender: 'Male',
          lastVisit: '2024-01-13',
          status: 'Active',
          urgency: 'Medium'
        },
        {
          id: 'P004',
          name: 'Emily Davis',
          age: 28,
          gender: 'Female',
          lastVisit: '2024-01-12',
          status: 'Active',
          urgency: 'Normal'
        },
        {
          id: 'P005',
          name: 'Robert Wilson',
          age: 55,
          gender: 'Male',
          lastVisit: '2024-01-11',
          status: 'Active',
          urgency: 'High'
        }
      ];
      
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient) => {
    setSelectedPatientId(patient.id);
    onPatientSelect(patient.id);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ffc107';
      case 'Normal': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Normal': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '15px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          📋 Patient Records
        </h2>
        
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 15px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
          <span style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d'
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Patient List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 80px 120px 100px 80px',
          gap: '15px',
          padding: '15px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#495057'
        }}>
          <div>Patient Name</div>
          <div>Age</div>
          <div>Gender</div>
          <div>Last Visit</div>
          <div>Status</div>
          <div>Priority</div>
        </div>

        {/* Patient Rows */}
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            🔄 Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 120px 100px 80px',
                gap: '15px',
                padding: '15px 20px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: selectedPatientId === patient.id ? '#e3f2fd' : 'white',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedPatientId !== patient.id) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPatientId !== patient.id) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                    {patient.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    ID: {patient.id}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#495057'
              }}>
                {patient.age}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#495057'
              }}>
                {patient.gender === 'Male' ? '👨' : '👩'} {patient.gender.charAt(0)}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                color: '#6c757d'
              }}>
                {patient.lastVisit}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: patient.status === 'Active' ? '#d4edda' : '#f8d7da',
                  color: patient.status === 'Active' ? '#155724' : '#721c24',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {patient.status}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: getUrgencyColor(patient.urgency)
                }}>
                  {getUrgencyIcon(patient.urgency)}
                  {patient.urgency}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {patients.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Total Patients
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {patients.filter(p => p.urgency === 'High').length}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            High Priority
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {patients.filter(p => p.status === 'Active').length}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Active Cases
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;