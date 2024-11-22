import json
import os
import re

import requests

# Path to the JSON file
json_file_path = "../memes.json"  # Update this to the actual path of your JSON file

# Directory to save the downloaded images
output_directory = "../downloaded_memes"
os.makedirs(output_directory, exist_ok=True)


# Function to sanitize the filename
def sanitize_filename(name):
    # Replace special characters with underscores
    return re.sub(r"[^\w\s-]", "_", name).strip()


# Function to download an image
def download_image(url, filename):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Check if the request was successful
        with open(filename, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        print(f"Downloaded: {filename}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to download {url}. Error: {e}")


# Load the JSON file
with open(json_file_path, "r") as file:
    data = json.load(file)

# Extract the memes list
memes = data.get("data", {}).get("memes", [])

# Download each meme
for meme in memes:
    url = meme.get("url")
    name = meme.get("name", "unknown")
    sanitized_name = sanitize_filename(name.replace(" ", "_"))
    image_id = meme.get("id")
    if url:
        output_file = os.path.join(output_directory, f"{image_id}_{sanitized_name}.jpg")
        download_image(url, output_file)

print("All downloads are complete.")
