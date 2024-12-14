import React, { useState } from 'react';
import Confetti from 'react-confetti';
import { FaRecycle, FaLeaf, FaHandHoldingHeart, FaMoneyBillWave } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

interface DetectionResponse {
  object: string;
  materials: string[];
}

interface AnalysisResponse {
  environmental_impact: {
    CO2_emissions: string;
    hazardous_effects: string[];
    degradation_time: Record<string, string>;
  };
  recycling: {
    steps: string[];
    nearby_centers: Array<{
      name: string;
      address: string;
      contact: string;
    }>;
  };
  upcycling: {
    ideas: string[];
  };
}

const MOCK_RESPONSES = {
  laptop: {
    detection: {
      object: "Laptop",
      materials: ["Plastic", "Aluminum", "Circuit Board", "Glass", "Lithium Battery"]
    },
    analysis: {
      environmental_impact: {
        CO2_emissions: "5.2 kg CO2 per unit",
        hazardous_effects: [
          "Releases toxic chemicals when disposed in landfills",
          "Contains heavy metals that can contaminate soil and water",
          "Produces harmful fumes if incinerated"
        ],
        degradation_time: {
          "Plastic": "450-1000 years",
          "Metal": "50-100 years",
          "Circuit Board": "Indefinite"
        }
      },
      recycling: {
        steps: [
          "Remove batteries and dispose of them separately",
          "Separate plastic casing from internal components",
          "Take to an e-waste recycling center",
          "Ensure data is wiped from storage devices"
        ],
        nearby_centers: [
          {
            name: "Green E-Cycle Center",
            address: "123 Recycling Ave, Green City",
            contact: "+1-555-0123"
          },
          {
            name: "Tech Waste Solutions",
            address: "456 Environment St, Eco Town",
            contact: "+1-555-0456"
          }
        ]
      },
      upcycling: {
        ideas: [
          "Convert old monitor into a digital photo frame",
          "Use circuit boards for artistic projects",
          "Repurpose computer case as a storage container",
          "Create decorative items from cleaned components"
        ]
      }
    }
  },
  phone: {
    detection: {
      object: "Smartphone",
      materials: ["Glass", "Aluminum", "Lithium Battery", "Circuit Board", "Rare Earth Metals"]
    },
    analysis: {
      environmental_impact: {
        CO2_emissions: "2.8 kg CO2 per unit",
        hazardous_effects: [
          "Battery leakage can contaminate groundwater",
          "Contains precious metals that are resource-intensive to mine",
          "Screen components contain hazardous materials"
        ],
        degradation_time: {
          "Glass": "1-2 million years",
          "Metal": "50-100 years",
          "Battery": "100-500 years"
        }
      },
      recycling: {
        steps: [
          "Back up and reset your device",
          "Remove the battery if possible",
          "Take to a certified electronics recycler",
          "Request a recycling certificate if available"
        ],
        nearby_centers: [
          {
            name: "Mobile Recycling Hub",
            address: "789 Tech Ave, Smart City",
            contact: "+1-555-0789"
          }
        ]
      },
      upcycling: {
        ideas: [
          "Convert into a dedicated music player",
          "Use as a security camera",
          "Create a smart home controller",
          "Turn into a dedicated GPS device"
        ]
      }
    }
  },
  printer: {
    detection: {
      object: "Printer",
      materials: ["Plastic", "Metal", "Circuit Board", "Glass", "Ink Cartridges"]
    },
    analysis: {
      environmental_impact: {
        CO2_emissions: "3.9 kg CO2 per unit",
        hazardous_effects: [
          "Ink cartridges contain toxic chemicals",
          "Plastic components take centuries to decompose",
          "Electronic components contain lead and mercury"
        ],
        degradation_time: {
          "Plastic": "450-1000 years",
          "Cartridges": "450-1000 years",
          "Circuit Board": "Indefinite"
        }
      },
      recycling: {
        steps: [
          "Remove and recycle ink cartridges separately",
          "Disconnect all cables",
          "Separate plastic and metal components",
          "Take to an e-waste collection point"
        ],
        nearby_centers: [
          {
            name: "PrintCycle Center",
            address: "321 Ink Street, Print City",
            contact: "+1-555-0321"
          }
        ]
      },
      upcycling: {
        ideas: [
          "Convert into a storage box",
          "Use parts for DIY robotics projects",
          "Create an industrial-style lamp",
          "Make a unique planter box"
        ]
      }
    }
  }
};

const USE_MOCK_DATA = false;

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [detection, setDetection] = useState<DetectionResponse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentPage, setCurrentPage] = useState<'main' | 'recycleSteps' | 'upcycleSteps' | 'recyclePoints'>('main');
  const [showRecycledPopup, setShowRecycledPopup] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);

  const resetAllStates = () => {
    setAnalysis(null);
    setDetection(null);
    setShowConfetti(false);
    setShowRecycledPopup(false);
    setShowComingSoonPopup(false);
    setCurrentPage('main');
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      resetAllStates();
      
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    // Check file size (max 4MB)
    if (selectedFile.size > 4 * 1024 * 1024) {
      alert('Please upload an image smaller than 4MB.');
      return;
    }

    setAnalysis(null);
    setDetection(null);
    setLoading(true);

    try {
      console.log('Preparing to upload file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      // Create FormData with the correct field name
      const formData = new FormData();
      formData.append('file', selectedFile);

      // First API call - Detection
      console.log('Sending request to detect API...');
      const detectResponse = await fetch('https://reclaim-backend.el.r.appspot.com/detect', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const responseText = await detectResponse.text();
      console.log('Raw API Response:', responseText);

      if (!detectResponse.ok) {
        console.error('Detection API Error:', {
          status: detectResponse.status,
          statusText: detectResponse.statusText,
          response: responseText,
          headers: Object.fromEntries(detectResponse.headers.entries())
        });

        // Try to parse error message
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || errorData.message || 'Detection failed');
        } catch (e) {
          throw new Error(`Detection failed: ${detectResponse.status} - ${responseText}`);
        }
      }

      let detectData;
      try {
        detectData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse detection response:', responseText);
        throw new Error('Invalid response from detection API');
      }

      console.log('Detect API response:', detectData);
      
      if (!detectData.object || !Array.isArray(detectData.materials)) {
        console.error('Invalid detection response format:', detectData);
        throw new Error('Invalid detection response format');
      }

      setDetection(detectData);

      // Second API call - Analysis
      console.log('Sending request to analyze API with data:', detectData);
      const analysisResponse = await fetch('https://reclaim-backend.el.r.appspot.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(detectData)
      });

      const analysisText = await analysisResponse.text();
      console.log('Raw Analysis Response:', analysisText);

      if (!analysisResponse.ok) {
        console.error('Analysis API Error:', {
          status: analysisResponse.status,
          statusText: analysisResponse.statusText,
          response: analysisText,
          headers: Object.fromEntries(analysisResponse.headers.entries())
        });

        // Try to parse error message
        try {
          const errorData = JSON.parse(analysisText);
          throw new Error(errorData.error || errorData.message || 'Analysis failed');
        } catch (e) {
          throw new Error(`Analysis failed: ${analysisResponse.status} - ${analysisText}`);
        }
      }

      let analysisData;
      try {
        analysisData = JSON.parse(analysisText);
      } catch (e) {
        console.error('Failed to parse analysis response:', analysisText);
        throw new Error('Invalid response from analysis API');
      }

      console.log('Analyze API response:', analysisData);

      if (!analysisData.environmental_impact || !analysisData.recycling || !analysisData.upcycling) {
        console.error('Invalid analysis response format:', analysisData);
        throw new Error('Invalid analysis response format');
      }

      setAnalysis(analysisData);

    } catch (error) {
      console.error('Error details:', error);
      resetAllStates();
      
      if (error instanceof Error) {
        // Log the full error details
        console.error('Full error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });

        // Show user-friendly error message
        if (error.message.includes('Failed to fetch')) {
          alert('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('400')) {
          alert('The image format is not supported. Please try uploading a JPG, PNG, or WebP image under 4MB.');
        } else if (error.message.includes('500')) {
          alert('Server error. The image could not be analyzed. Please try a different image or try again later.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        console.error('Unknown error:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecycle = () => {
    setCurrentPage('recycleSteps');
  };

  const handleUpcycle = () => {
    setCurrentPage('upcycleSteps');
  };

  const handleBack = () => {
    setCurrentPage('main');
  };

  const handleRecycled = () => {
    setShowConfetti(true);
    setShowRecycledPopup(true);
    setPoints(prev => prev + 10);
    setTimeout(() => {
      setShowConfetti(false);
      setShowRecycledPopup(false);
      setCurrentPage('main');
    }, 3000);
  };

  const handleUpcycled = () => {
    setShowConfetti(true);
    setShowRecycledPopup(true);
    setPoints(prev => prev + 20);
    setTimeout(() => {
      setShowConfetti(false);
      setShowRecycledPopup(false);
      setCurrentPage('main');
    }, 3000);
  };

  const handleFindRecyclePoints = () => {
    setCurrentPage('recyclePoints');
  };

  const ComingSoonPopup = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-4">
          This feature will be available in future updates.
        </p>
        <button
          onClick={() => setShowComingSoonPopup(false)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );

  const RecycleStepsPage = () => (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-primary hover:text-green-600 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Analysis
            </button>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Recycling Steps</h2>
              {detection && (
                <div className="mb-6">
                  <p className="font-medium text-center text-gray-700">
                    Item: {detection.object}
                  </p>
                </div>
              )}
              <ul className="list-none space-y-4 mb-8">
                {analysis?.recycling.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3">
                      {index + 1}
                    </span>
                    <span className="mt-1">{step}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleRecycled}
                className="bg-primary text-white px-6 py-3 rounded-lg w-full hover:bg-green-600 transition-colors font-semibold text-lg"
              >
                I Recycled It! 🌱
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UpcycleStepsPage = () => (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-primary hover:text-green-600 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Analysis
            </button>
            
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Upcycling Ideas</h2>
              {detection && (
                <div className="mb-6">
                  <p className="font-medium text-center text-gray-700">
                    Item: {detection.object}
                  </p>
                </div>
              )}
              <ul className="list-none space-y-4 mb-8">
                {analysis?.upcycling.ideas.map((idea, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent text-white rounded-full mr-3">
                      {index + 1}
                    </span>
                    <span className="mt-1">{idea}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpcycled}
                className="bg-accent text-white px-6 py-3 rounded-lg w-full hover:bg-orange-600 transition-colors font-semibold text-lg"
              >
                I Upcycled It! 🎨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RecyclePointsPage = () => (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-primary hover:text-green-600 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Analysis
            </button>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Nearest Recycle Points</h2>
              
              <div className="mb-8 text-center">
                <div className="w-48 h-48 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  Coming Soon!
                </p>
                <p className="text-gray-500">
                  We're working on integrating a map feature to help you find the nearest recycling points in your area. 
                  Stay tuned for updates!
                </p>
              </div>

              {/* Placeholder Recycle Point */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h3 className="font-semibold text-lg mb-2">Sample Recycle Center</h3>
                <div className="text-gray-600">
                  <p>📍 123 Green Street, Eco City</p>
                  <p>📞 (555) 123-4567</p>
                  <p>⏰ Mon-Sat: 9AM-6PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainPage = () => (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {showConfetti && <Confetti />}
      
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8 text-primary">Reclaim</h1>
                
                {/* File Upload Section */}
                <div className="mb-8">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept="image/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg block text-center hover:bg-green-600 transition-colors"
                  >
                    Select Image
                  </label>
                  {preview && (
                    <div className="mt-4">
                      <img src={preview} alt="Preview" className="max-w-full rounded-lg" />
                      <button
                        onClick={handleUpload}
                        className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <ClipLoader color="#ffffff" size={20} className="mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Detection Results */}
                {detection && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold mb-2">Detected Item</h2>
                    <p className="font-medium">{detection.object}</p>
                    <h3 className="font-semibold mt-2">Materials:</h3>
                    <ul className="list-disc pl-5">
                      {detection.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">Environmental Impact</h2>
                      <p>CO2 Emissions: {analysis.environmental_impact.CO2_emissions}</p>
                      <div className="mt-2">
                        <h3 className="font-semibold">Hazardous Effects:</h3>
                        <ul className="list-disc pl-5">
                          {analysis.environmental_impact.hazardous_effects.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={handleRecycle}
                        className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FaRecycle className="mr-2" /> Recycle
                      </button>
                      <button
                        onClick={handleUpcycle}
                        className="flex items-center justify-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <FaLeaf className="mr-2" /> Upcycle
                      </button>
                      <button
                        className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        onClick={() => setShowComingSoonPopup(true)}
                      >
                        <FaHandHoldingHeart className="mr-2" /> Donate
                      </button>
                      <button
                        className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        onClick={() => setShowComingSoonPopup(true)}
                      >
                        <FaMoneyBillWave className="mr-2" /> Sell
                      </button>
                      <button
                        onClick={handleFindRecyclePoints}
                        className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors col-span-2"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Find Nearest Recycle Point
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentPage === 'main' ? <MainPage /> : 
       currentPage === 'recycleSteps' ? <RecycleStepsPage /> : 
       currentPage === 'upcycleSteps' ? <UpcycleStepsPage /> :
       <RecyclePointsPage />}
      
      {/* Recycled/Upcycled Popup */}
      {showRecycledPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl mb-4">You got {currentPage === 'recycleSteps' ? '10' : '20'} pts</p>
          </div>
        </div>
      )}

      {/* Coming Soon Popup */}
      {showComingSoonPopup && <ComingSoonPopup />}
    </>
  );
}

export default App;
