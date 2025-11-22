import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Paper, Typography } from '@mui/material';

function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeJob = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/jobs/analyze', {
        description: jobDescription
      });
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <Paper style={{ padding: 20, margin: 20 }}>
      <Typography variant="h5" gutterBottom>
        Analyseur d'Offres d'Emploi
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Collez l'offre d'emploi ici..."
        margin="normal"
      />
      <Button 
        variant="contained" 
        onClick={analyzeJob}
        disabled={loading}
      >
        {loading ? 'Analyse en cours...' : 'Analyser'}
      </Button>
      {analysis && (
        <Paper style={{ marginTop: 20, padding: 15, backgroundColor: '#f5f5f5' }}>
          <pre>{analysis}</pre>
        </Paper>
      )}
    </Paper>
  );
}

export default JobAnalyzer;