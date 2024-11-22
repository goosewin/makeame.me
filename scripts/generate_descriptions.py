import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI

# Load the .env file
load_dotenv()

# Retrieve the API key
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

# Paths
input_json_path = "../memes.json"
output_json_path = "../annotated_memes.json"
memes_folder = "../public/memes"


# Function to sanitize filenames
def sanitize_filename(name):
    return re.sub(r"[^\w\s-]", "_", name).strip()


# Function to generate description and instructions
def generate_description_and_instructions(meme_name):
    try:
        messages = [
            {
                "role": "system",
                "content": "You are an assistant that writes plain text descriptions and instructions for internet memes.",
            },
            {
                "role": "user",
                "content": f"Create a short description and clear instructions for the meme '{meme_name}'.",
            },
        ]
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            max_tokens=300,  # Increased limit to avoid truncation
        )
        content = response.choices[0].message.content.strip()

        # Split the response into description and instructions
        parts = content.split("Instructions:")
        description = (
            parts[0].strip() if len(parts) > 0 else "No description available."
        )
        instructions = (
            parts[1].strip() if len(parts) > 1 else "No instructions available."
        )

        return description, instructions
    except Exception as e:
        print(f"Error generating description for '{meme_name}': {e}")
        return "No description available.", "No instructions available."


# Load memes JSON
with open(input_json_path, "r") as file:
    memes_data = json.load(file)

annotated_memes = {"memes": []}

# Process each meme
for meme in memes_data.get("data", {}).get("memes", []):
    meme_id = meme.get("id")
    meme_name = meme.get("name")
    sanitized_name = sanitize_filename(meme_name.replace(" ", "_"))
    image_path = os.path.join(memes_folder, f"{meme_id}_{sanitized_name}.jpg")

    if os.path.exists(image_path):
        print(f"Processing: {meme_name}")

        # Generate description and instructions
        description, instructions = generate_description_and_instructions(meme_name)

        # Add metadata to the output
        annotated_memes["memes"].append(
            {
                "id": meme_id,
                "name": meme_name,
                "template_url": image_path,
                "description": description,
                "instructions": instructions,
            }
        )
    else:
        print(f"Image not found for {meme_name}: {image_path}")

# Save results
with open(output_json_path, "w") as file:
    json.dump(annotated_memes, file, indent=4)

print(f"Annotated meme metadata saved to {output_json_path}")
