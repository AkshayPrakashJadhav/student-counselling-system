import requests

url = "http://127.0.0.1:5001/api/book-followup"  # Make sure port matches Flask server
data = {
    "student_id": "1RN23AD062",
    "previous_session_id": 1,  # Use an actual session ID from DB
    "date": "2026-03-25",
    "time": "15:00"
}

response = requests.post(url, json=data)
print(response.json())