# Image Generator with Reference

A web application that leverages OpenAI's DALL-E 3 model to generate images based on user prompts and selected design styles, using reference images for style consistency.

## Features

- Generate 1024x1024 images using DALL-E 3 model
- Choose from different design styles with reference images:
  - Silhouette Painting Technique
  - Realistic Image
  - 3D Animations
  - Line Art Contour Drawing
- Side-by-side comparison of reference image and generated result
- Simple and intuitive web interface

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your OpenAI API key (already included in the code)

## Usage

1. Start the server:
   ```
   npm start
   ```
2. Open your browser and navigate to http://localhost:3000
3. Enter a description for the image you want to generate
4. Select a style by clicking on one of the reference images
5. Click "Generate Image"
6. Wait for the image to be generated (this may take a few moments)
7. The generated image will be displayed next to the reference image for comparison
8. All generated images are also saved in the `image` folder

## How It Works

The application uses reference images to enhance the prompts sent to DALL-E 3. When you select a style, the system:

1. Uses the reference image as a visual guide
2. Combines your prompt with style-specific instructions
3. Generates an image that maintains consistency with the reference style
4. Displays both the reference and generated image side by side

## Requirements

- Node.js 18 or higher
- An OpenAI API key with access to DALL-E 3

## Note

This application requires a valid OpenAI API key with access to the DALL-E 3 model. The API key is charged based on usage according to OpenAI's pricing.
