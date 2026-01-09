#!/usr/bin/env python3
"""
Create OG image with held_logo_mixed.png on gold/brownish background
Color: hsl(50 12% 32%) = RGB(89, 87, 72) = #595748
"""

from PIL import Image
import os

# Color: hsl(50 12% 32%) = RGB(89, 87, 72)
BACKGROUND_COLOR = (89, 87, 72)  # Gold/brownish color
IMAGE_SIZE = (1200, 630)  # Standard OG image size

def create_og_image():
    # Load the logo
    logo_path = "public/held_logo_mixed.png"
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found")
        return
    
    logo = Image.open(logo_path)
    
    # Convert logo to RGBA if needed
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    # Create new image with gold/brownish background
    og_image = Image.new('RGB', IMAGE_SIZE, BACKGROUND_COLOR)
    
    # Calculate position to center the logo
    # Leave minimal padding around the edges for bigger logo
    padding = 40
    max_logo_width = IMAGE_SIZE[0] - (padding * 2)
    max_logo_height = IMAGE_SIZE[1] - (padding * 2)
    
    # Scale logo to fit while maintaining aspect ratio
    logo_aspect = logo.width / logo.height
    if logo.width > logo.height:
        # Logo is wider
        new_width = min(logo.width, max_logo_width)
        new_height = int(new_width / logo_aspect)
    else:
        # Logo is taller
        new_height = min(logo.height, max_logo_height)
        new_width = int(new_height * logo_aspect)
    
    # Resize logo
    logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Calculate center position
    x = (IMAGE_SIZE[0] - new_width) // 2
    y = (IMAGE_SIZE[1] - new_height) // 2
    
    # Paste logo onto background
    og_image.paste(logo_resized, (x, y), logo_resized)
    
    # Save the image
    output_path = "public/held_og_image.png"
    og_image.save(output_path, "PNG", optimize=True)
    print(f"Created {output_path}")
    print(f"Size: {IMAGE_SIZE[0]}x{IMAGE_SIZE[1]} pixels")

if __name__ == "__main__":
    try:
        create_og_image()
    except ImportError:
        print("Error: PIL (Pillow) is not installed.")
        print("Install it with: pip install Pillow")
    except Exception as e:
        print(f"Error: {e}")

