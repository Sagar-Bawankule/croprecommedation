import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle, BarChart3, DollarSign } from 'lucide-react';

// FormattedMarkdown component for rendering markdown content
const FormattedMarkdown = ({ content, className = '' }) => {
  if (!content) return null;

  // Convert markdown-like formatting to HTML
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1em; font-weight: 600; margin: 16px 0 8px 0; color: #374151;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.2em; font-weight: 700; margin: 20px 0 10px 0; color: #1f2937;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.3em; font-weight: 800; margin: 24px 0 12px 0; color: #111827;">$1</h1>')
    .replace(/^- (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px;">$1</li>')
    .replace(/(\n|^)([^<\n]+)(\n|$)/g, '$1<p style="margin: 8px 0; line-height: 1.5;">$2</p>$3')
    .replace(/(<li[^>]*>.*<\/li>\s*)+/gs, '<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">$&</ul>');

  return (
    <div 
      className={`formatted-content bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        lineHeight: '1.7',
        wordBreak: 'break-word',
        maxHeight: '500px',
        overflowY: 'auto'
      }}
    />
  );
};

const CropTreatmentAnalysis = () => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropList, setCropList] = useState([]);
  const [soilParameters, setSoilParameters] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [farmSize, setFarmSize] = useState('1');
  const [cropAnalysisResult, setCropAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCropList();
  }, []);

  const fetchCropList = async () => {
    try {
      console.log('Fetching crop list from /api/crops...');
      const response = await fetch('/api/crops');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Crop list response:', data);
      
      setCropList(data.crops || []);
    } catch (error) {
      console.error('Error fetching crop list:', error);
      // Set fallback crop list in case of error
      const fallbackCrops = ['rice', 'maize', 'chickpea', 'wheat', 'cotton', 'banana', 'mango', 'orange'];
      setCropList(fallbackCrops);
    }
  };

  const validateSoilParameters = (params) => {
    const errors = {};
    
    if (!params.N || params.N < 0 || params.N > 200) {
      errors.N = 'Nitrogen must be between 0-200 kg/ha';
    }
    if (!params.P || params.P < 0 || params.P > 100) {
      errors.P = 'Phosphorus must be between 0-100 kg/ha';
    }
    if (!params.K || params.K < 0 || params.K > 300) {
      errors.K = 'Potassium must be between 0-300 kg/ha';
    }
    if (!params.ph || params.ph < 3.5 || params.ph > 9.5) {
      errors.ph = 'pH must be between 3.5-9.5';
    }
    if (!params.temperature || params.temperature < -10 || params.temperature > 50) {
      errors.temperature = 'Temperature must be between -10°C to 50°C';
    }
    if (!params.humidity || params.humidity < 0 || params.humidity > 100) {
      errors.humidity = 'Humidity must be between 0-100%';
    }
    if (!params.rainfall || params.rainfall < 0 || params.rainfall > 3000) {
      errors.rainfall = 'Rainfall must be between 0-3000mm';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'selectedCrop') {
      setSelectedCrop(value);
    } else if (name === 'farmSize') {
      setFarmSize(value);
    } else {
      setSoilParameters(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCropAnalysis = async (detailedAnalysis = true) => {
    if (!selectedCrop) {
      alert('Please select a crop for analysis');
      return;
    }

    const soilParams = {
      N: parseFloat(soilParameters.N),
      P: parseFloat(soilParameters.P),
      K: parseFloat(soilParameters.K),
      temperature: parseFloat(soilParameters.temperature),
      humidity: parseFloat(soilParameters.humidity),
      ph: parseFloat(soilParameters.ph),
      rainfall: parseFloat(soilParameters.rainfall)
    };

    const validation = validateSoilParameters(soilParams);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsAnalyzing(true);
    setErrors({});

    try {
      // Use detailed analysis endpoint for comprehensive results
      const endpoint = detailedAnalysis ? '/api/analyze-crop-detailed' : '/api/analyze-crop';
      
      const requestBody = {
        selected_crop: selectedCrop,
        soil_parameters: soilParams
      };
      
      // Add farm size for detailed analysis
      if (detailedAnalysis) {
        requestBody.farm_size_hectares = parseFloat(farmSize) || 1;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Crop analysis result:', result);
      setCropAnalysisResult(result);

    } catch (error) {
      console.error('Error analyzing crop:', error);
      alert('Error analyzing crop. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuitabilityColor = (suitability) => {
    if (suitability >= 80) return 'text-green-600 bg-green-50';
    if (suitability >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuitabilityIcon = (suitability) => {
    if (suitability >= 80) return <CheckCircle className="h-5 w-5" />;
    if (suitability >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Leaf className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Crop Treatment Analysis</h2>
        </div>

        {/* Crop Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Crop for Treatment Analysis
          </label>
          <select
            name="selectedCrop"
            value={selectedCrop}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a crop...</option>
            {cropList.map((crop, index) => (
              <option key={index} value={crop}>
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Soil Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nitrogen (N) kg/ha
            </label>
            <input
              type="number"
              name="N"
              value={soilParameters.N}
              onChange={handleInputChange}
              placeholder="0-200"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.N ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.N && <p className="text-red-500 text-xs mt-1">{errors.N}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phosphorus (P) kg/ha
            </label>
            <input
              type="number"
              name="P"
              value={soilParameters.P}
              onChange={handleInputChange}
              placeholder="0-100"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.P ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.P && <p className="text-red-500 text-xs mt-1">{errors.P}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potassium (K) kg/ha
            </label>
            <input
              type="number"
              name="K"
              value={soilParameters.K}
              onChange={handleInputChange}
              placeholder="0-300"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.K ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.K && <p className="text-red-500 text-xs mt-1">{errors.K}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              pH Level
            </label>
            <input
              type="number"
              step="0.1"
              name="ph"
              value={soilParameters.ph}
              onChange={handleInputChange}
              placeholder="3.5-9.5"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.ph ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.ph && <p className="text-red-500 text-xs mt-1">{errors.ph}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              value={soilParameters.temperature}
              onChange={handleInputChange}
              placeholder="-10 to 50"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Humidity (%)
            </label>
            <input
              type="number"
              name="humidity"
              value={soilParameters.humidity}
              onChange={handleInputChange}
              placeholder="0-100"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.humidity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.humidity && <p className="text-red-500 text-xs mt-1">{errors.humidity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rainfall (mm)
            </label>
            <input
              type="number"
              name="rainfall"
              value={soilParameters.rainfall}
              onChange={handleInputChange}
              placeholder="0-3000"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rainfall ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.rainfall && <p className="text-red-500 text-xs mt-1">{errors.rainfall}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size (hectares)
            </label>
            <input
              type="number"
              name="farmSize"
              value={farmSize}
              onChange={handleInputChange}
              placeholder="1"
              min="0.1"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Analysis Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleCropAnalysis(false)}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
          >
            {isAnalyzing ? (
              <>🔄 Analyzing...</>
            ) : (
              <>⚡ Quick Treatment</>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleCropAnalysis(true)}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
          >
            {isAnalyzing ? (
              <>🔄 Analyzing...</>
            ) : (
              <>📊 Detailed Treatment Plan</>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {cropAnalysisResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">
              Analysis Results for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
            </h3>
          </div>

          {/* Suitability Score */}
          {cropAnalysisResult.analysis && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg border-2 ${getSuitabilityColor(cropAnalysisResult.analysis.suitability_score)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getSuitabilityIcon(cropAnalysisResult.analysis.suitability_score)}
                    <div className="ml-3">
                      <h4 className="font-bold text-lg">
                        Suitability Score: {cropAnalysisResult.analysis.suitability_score.toFixed(1)}%
                      </h4>
                      <p className="text-sm opacity-80">
                        {cropAnalysisResult.analysis.is_suitable ? 'Suitable for cultivation' : 'Needs improvement'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {cropAnalysisResult.analysis.suitability_score >= 80 ? '🌟' : 
                       cropAnalysisResult.analysis.suitability_score >= 60 ? '⚠️' : '❌'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Analysis */}
          {cropAnalysisResult.analysis && cropAnalysisResult.analysis.parameter_analysis && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Parameter Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(cropAnalysisResult.analysis.parameter_analysis).map(([param, data]) => (
                  <div key={param} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        {param.toUpperCase()}: {data.current}
                        {param === 'ph' ? '' : param === 'temperature' ? '°C' : param === 'humidity' ? '%' : param === 'rainfall' ? 'mm' : ' kg/ha'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        data.status === 'optimal' ? 'bg-green-100 text-green-800' :
                        data.status === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Optimal range: {data.optimal_range}
                    </div>
                    {data.recommendation && (
                      <div className="text-sm text-blue-600 mt-1">
                        💡 {data.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Plan */}
          {cropAnalysisResult.improvement_plan && cropAnalysisResult.improvement_plan.improvements && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4 flex items-center text-orange-900">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                🔧 Improvement Plan
              </h4>
              <div className="space-y-4">
                {cropAnalysisResult.improvement_plan.improvements.map((improvement, index) => (
                  <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-orange-900">{improvement.parameter}</h5>
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
                        {improvement.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-orange-800 mb-2">{improvement.issue}</p>
                    <p className="text-sm text-orange-700 font-medium">{improvement.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Analysis */}
          {cropAnalysisResult.cost_analysis && cropAnalysisResult.cost_analysis.breakdown && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4 flex items-center text-green-900">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                💰 Cost Analysis ({farmSize} hectare{parseFloat(farmSize) !== 1 ? 's' : ''})
              </h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {cropAnalysisResult.cost_analysis.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm text-green-800">{item.item}</span>
                      <span className="font-medium text-green-900">₹{item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-green-300">
                  <span className="font-bold text-green-900">Total Cost:</span>
                  <span className="font-bold text-lg text-green-900">
                    ₹{cropAnalysisResult.cost_analysis.total_cost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {cropAnalysisResult.improvement_plan && cropAnalysisResult.improvement_plan.message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold mb-3 text-green-900">✅ Status Update</h4>
              <p className="text-sm text-green-800">
                {cropAnalysisResult.improvement_plan.message}
              </p>
            </div>
          )}

          {cropAnalysisResult.cost_analysis && cropAnalysisResult.cost_analysis.message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold mb-3 text-green-900">💰 Cost Status</h4>
              <p className="text-sm text-green-800">
                {cropAnalysisResult.cost_analysis.message}
              </p>
            </div>
          )}

          {/* Legacy Treatment Plan */}
          {cropAnalysisResult.treatment_plan && !cropAnalysisResult.improvement_plan && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-3 text-blue-900">🔧 AI Treatment Plan</h4>
              <div className="text-sm text-blue-800">
                <FormattedMarkdown 
                  content={cropAnalysisResult.treatment_plan}
                  className="text-blue-800"
                />
              </div>
            </div>
          )}
          
          {/* Success message for suitable conditions */}
          {cropAnalysisResult.analysis && cropAnalysisResult.analysis.is_suitable && !cropAnalysisResult.improvement_plan && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                🎉 Great! Your soil conditions are already suitable for growing {selectedCrop}. 
                Continue with your current practices and monitor regularly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropTreatmentAnalysis;