import requests

data = {
    "lot_values": [10.0, 10.2, 10.1, 10.4, 10.3],
    "component_value": 12.0
}

response = requests.post(
    "http://127.0.0.1:5000/api/module-a",
    json=data
)

print(response.json())