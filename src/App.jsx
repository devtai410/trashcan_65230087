import React, { useEffect, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { Spinner, Alert } from 'react-bootstrap';  // Import Alert
import { toast, ToastContainer } from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const URL = 'model/'; // Path to your model files
  const [model, setModel] = useState(null);
  const [labelContainer, setLabelContainer] = useState(''); // Store the Alert component
  const [isModelReady, setIsModelReady] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const modelURL = URL + 'model.json';
        const metadataURL = URL + 'metadata.json';

        // Load the Teachable Machine model and metadata
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setIsModelReady(true);
      } catch (error) {
        console.error('Error initializing model:', error);
        toast.error('Failed to load the model!');
      }
    };

    init();
  }, []);

  const handleImageUpload = (event) => {
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      // Use FileReader to convert the image to a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // After the image is loaded, perform prediction
          predict(img);
        };
        img.src = e.target.result; // Set image source to data URL
        setImage(img); // Store the uploaded image
      };
      reader.readAsDataURL(uploadedImage); // Read the uploaded file as data URL
    }
  };

  const predict = async (img) => {
    if (!model || !img) return;

    // Create a canvas and draw the image on it
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    // Make predictions on the image
    const predictions = await model.predict(canvas);
    const updatedLabels = predictions.map((pred) => pred.probability);

    // Set the label container to show an alert based on predictions
    if (updatedLabels[0] > updatedLabels[1]) {
      toast.error('ถังขยะยังไม่เต็ม!');
      setLabelContainer(
        <Alert variant="danger">ถังขยะยังไม่เต็ม!</Alert>  // Show alert for "not full"
      );
    } else if (updatedLabels[0] < updatedLabels[1]) {
      toast.success('ถังขยะเต็มแล้ว!');
      setLabelContainer(
        <Alert variant="success">ถังขยะเต็มแล้ว!</Alert>  // Show alert for "full"
      );
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Trashcan ระบบตรวจคัดแยกถังขยะ</h1>

      <div className="row mt-4">
        {/* Column for file upload */}
        <div className="col-md-6 text-center">
          {isModelReady ? (
            <div>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {image && (
                <img
                  src={image.src}
                  alt="Uploaded"
                  style={{ maxWidth: '100%', marginTop: '20px' }}
                />
              )}
            </div>
          ) : (
            <div>
              <Spinner animation="border" role="status" />
              <span> Loading model...</span>
            </div>
          )}
        </div>

        {/* Column for prediction result */}
        <div className="col-md-6">
          <div id="label-container" className="mt-5"> {/* Increased margin-top */}
            {labelContainer}  {/* Render the Alert here */}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
