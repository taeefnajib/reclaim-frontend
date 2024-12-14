# Project Overview
This is a web application named "Reclaim" that lets users scan an electronic waste and send it to a api endpoint which detects the waste and the possible recyclable materials. Then it gets the response and sends it to another api endpoint which returns a few things- what are the environmental impact of the waste if not recycled, how to recycle it and what are some ways to upcycle it.


# Core Functionalities 

1. Scan the waste and send it to the api endpoint https://reclaim-backend.el.r.appspot.com/detect which takes an image as input and returns the response which looks like this:
    ```json
    {
      "object": "<Name of the object>",
      "materials": ["<Material 1>", "<Material 2>", "<Material 3>", ...]
    }
    ```
2. Send the response to the api endpoint https://reclaim-backend.el.r.appspot.com/analyze which takes the response from the previous api endpoint and returns the response which looks like this:
    ```json
        {
          "environmental_impact": {
            "CO2_emissions": "<CO2 emissions per unit if not recycled>",
            "hazardous_effects": [
              "<Hazardous effect 1>",
              "<Hazardous effect 2>",
              ...
            ],
            "degradation_time": {
              "<Material 1>": "<Degradation time>",
              "<Material 2>": "<Degradation time>",
              ...
            }
          },
          "recycling": {
            "steps": [
              "<Recycling step 1>",
              "<Recycling step 2>",
              ...
            ],
            "nearby_centers": [
              {
                "name": "<Recycling center name>",
                "address": "<Recycling center address>",
                "contact": "<Recycling center contact>"
              },
              ...
            ]
          },
          "upcycling": {
            "ideas": [
              "<Upcycling idea 1>",
              "<Upcycling idea 2>",
              ...
            ]
          }        
        }
    ```
    3. Then after the image is scanned and the response is receieved, the environmental impact is displayed to the user. There will be 4 buttons "Recycle", "Upcycle", "Donate" and "Sell". 
    * If the user clicks on the button "Recycle" then the response from the api endpoint https://reclaim-backend.el.r.appspot.com/analyze will be displayed to the user. If Recycle button is clicked then nearby_centers will be displayed. It will show that this feature will be added in the future. If recycle button is clicked and the recycling ideas are displayed then another button "I have recycled" will be displayed. If "I have recycled" button is clicked then a popup will be displayed with confetti animation which will show "Congratulations! You got 10 pts" and a button "Go toLeaderboard" which if clicked will show the leaderboard with top 5 fake users..
    * If the user clicks on the button "Upcycle" then the response from the api endpoint https://reclaim-backend.el.r.appspot.com/analyze will be displayed to the user. There will be a button "I have upcycled" which if clicked will show a popup with confetti animation which will show "Congratulations! You got 20 pts" and a button "Go to Leaderboard" which if clicked will show the leaderboard with top 5 fake users.
    * There will be a button "Donate" which if clicked will show that this feature will be added in the future.
    * There will be a button "Sell" which if clicked will show that this feature will be added in the future.



# Doc 
The FastAPI backend can be found at https://github.com/taeefnajib/reclaim-backend
The code for the API looks like this:
```
import os
import google.generativeai as genai
from dotenv import load_dotenv
import warnings
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import tempfile
import json


# Suppress specific warning
warnings.filterwarnings('ignore', category=UserWarning, module='absl')

# Load environment variables
load_dotenv()

# Configure the API key from environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create FastAPI app
app = FastAPI()

def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    return file

# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)

@app.post("/detect")
async def detect_object(file: UploadFile = File(...)):
    # Create a temporary file to store the uploaded image
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        # Upload the temporary file to Gemini
        gemini_file = upload_to_gemini(temp_path, mime_type=file.content_type)
        
        prompt_parts = [
            gemini_file,
            """
            Analyze the provided image and identify the primary or most noticeable object. 
            Use a generic name for the object. Do not detect model or category of the object.
            Your response must strictly adhere to the following JSON format:

            ```json
            {
              "object": "<Name of the object>",
              "materials": ["<Material 1>", "<Material 2>", "<Material 3>", ...]
            }
            ```

            Ensure the output is a valid JSON string. Do not include any additional text or explanations outside of the JSON structure.
            The "object" field should contain the name of the identified object.
            The "materials" field should be an array listing the materials that make up the object.
            """
        ]

        response = model.generate_content(prompt_parts)
        
        # Clean up the temporary file
        os.unlink(temp_path)

        # Attempt to parse the response as JSON
        try:
            json_response = json.loads(response.text)
            return JSONResponse(content=json_response)
        except json.JSONDecodeError:
            return JSONResponse(status_code=500, content={"error": "Invalid JSON format in response"})
        
    
    except Exception as e:
        # Clean up the temporary file in case of error
        os.unlink(temp_path)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/analyze")
async def analyze_object(object_data: dict):
    try:
        # Validate the input data
        if not all(key in object_data for key in ["object", "materials"]):
            raise HTTPException(status_code=400, detail="Invalid input: 'object' and 'materials' are required.")

        prompt = f"""
        Analyze the following object and its materials for environmental impact, recycling, and upcycling:

        Object: {object_data["object"]}
        Materials: {", ".join(object_data["materials"])}

        Provide a JSON response in the following format:

        ```json
        {{
          "environmental_impact": {{
            "CO2_emissions": "<CO2 emissions per unit if not recycled>",
            "hazardous_effects": [
              "<Hazardous effect 1>",
              "<Hazardous effect 2>",
              ...
            ],
            "degradation_time": {{
              "<Material 1>": "<Degradation time>",
              "<Material 2>": "<Degradation time>",
              ...
            }}
          }},
          "recycling": {{
            "steps": [
              "<Recycling step 1>",
              "<Recycling step 2>",
              ...
            ],
            "nearby_centers": [
              {{
                "name": "<Recycling center name>",
                "address": "<Recycling center address>",
                "contact": "<Recycling center contact>"
              }},
              ...
            ]
          }},
          "upcycling": {{
            "ideas": [
              "<Upcycling idea 1>",
              "<Upcycling idea 2>",
              ...
            ]
          }}
        }}
        ```

        Ensure the output is a valid JSON string. Do not include any additional text or explanations outside of the JSON structure.
        """

        response = model.generate_content(prompt)

        # Attempt to parse the response as JSON
        try:
            json_response = json.loads(response.text)
            return JSONResponse(content=json_response)
        except json.JSONDecodeError:
            return JSONResponse(status_code=500, content={"error": "Invalid JSON format in response"})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
```

# Important Implementation Notes
* Implement a nice and modern UI for the web app.
* Make the web app responsive to different screen sizes so later I can turn it inta a browser  app for mobile users.
* Add a loading spinner while the image is being scanned.
* Add a loading spinner while the response is being fetched.
* Use react, typescript, tailwindcss for the frontend.
* I used FastAPI for the backend.  