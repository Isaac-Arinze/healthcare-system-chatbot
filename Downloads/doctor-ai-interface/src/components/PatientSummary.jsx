import React, { useState, useEffect } from 'react';
import ApiService from '../services/apiService';

const PatientSummary = ({ patientId, sessionId, onClose }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ApiService.getPatientSummary(patientId, sessionId);
        setPatientData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, sessionId]);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>⏳</div>
          <div>Loading patient summary...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px', color: '#dc3545' }}>❌</div>
          <div style={{ marginBottom: '20px', color: '#dc3545' }}>
            Error loading patient data: {error}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>
              📋 Patient Summary
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Patient ID: {patientData.patient_id} | Session: {sessionId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '5px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '25px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Patient Demographics */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            border: '1px solid #bbdefb'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1565c0', fontSize: '18px' }}>
              👤 Patient Demographics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div><strong>Name:</strong> {patientData.demographics.name}</div>
              <div><strong>Age:</strong> {patientData.demographics.age}</div>
              <div><strong>Gender:</strong> {patientData.demographics.gender}</div>
              <div><strong>DOB:</strong> {patientData.demographics.date_of_birth}</div>
              <div><strong>Blood Type:</strong> {patientData.demographics.blood_type}</div>
              <div><strong>Allergies:</strong> {patientData.demographics.allergies.join(', ')}</div>
            </div>
          </div>

          {/* Current Visit */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            border: '1px solid #ffcc02'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f57c00', fontSize: '18px' }}>
              🏥 Current Visit - {patientData.last_visit}
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Chief Complaint:</strong>
              <p style={{ margin: '5px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                {patientData.chief_complaint}
              </p>
            </div>
            <div>
              <strong>Diagnosis:</strong>
              <p style={{ margin: '5px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                {patientData.diagnosis}
              </p>
            </div>
          </div>

          {/* Vital Signs */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#f3e5f5',
            borderRadius: '8px',
            border: '1px solid #ce93d8'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#7b1fa2', fontSize: '18px' }}>
              📊 Vital Signs
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>BP:</strong> {patientData.vitals.blood_pressure}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>HR:</strong> {patientData.vitals.heart_rate}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>Temp:</strong> {patientData.vitals.temperature}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>RR:</strong> {patientData.vitals.respiratory_rate}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>O2 Sat:</strong> {patientData.vitals.oxygen_saturation}
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <strong>BMI:</strong> {patientData.vitals.bmi}
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '1px solid #ffcdd2'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#c62828', fontSize: '18px' }}>
              🩺 Medical Conditions
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {patientData.conditions.map((condition, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{condition.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Diagnosed: {condition.date_diagnosed}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: condition.severity === 'Severe' ? '#ffcdd2' : 
                                     condition.severity === 'Moderate' ? '#fff3e0' : '#e8f5e8',
                      color: condition.severity === 'Severe' ? '#c62828' : 
                             condition.severity === 'Moderate' ? '#f57c00' : '#2e7d32'
                    }}>
                      {condition.severity}
                    </span>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      {condition.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32', fontSize: '18px' }}>
              💊 Current Medications
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {patientData.medications.map((medication, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{medication.name}</strong> - {medication.dosage}
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {medication.frequency} | Prescribed: {medication.prescribed_date}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: medication.status === 'active' ? '#e8f5e8' : '#fff3e0',
                    color: medication.status === 'active' ? '#2e7d32' : '#f57c00'
                  }}>
                    {medication.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Results - Add this section before the closing content div */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#424242', fontSize: '18px' }}>
              🧪 Lab Results
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {patientData.lab_results && patientData.lab_results.map((lab, index) => (
                <div key={index} style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  borderLeft: `4px solid ${lab.status === 'normal' ? '#4caf50' : '#ff9800'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{lab.test_name}</strong>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                        {lab.date}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: lab.status === 'normal' ? '#e8f5e8' : '#fff3e0',
                      color: lab.status === 'normal' ? '#2e7d32' : '#f57c00'
                    }}>
                      {lab.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Result:</strong> {lab.result}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    <strong>Reference:</strong> {lab.reference_range}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 25px',
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Generated on {new Date().toLocaleString()} | FlexiAI Medical Assistant v2.1.0
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
// export default PatientSummary