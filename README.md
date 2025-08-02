# Carbon Neutral Home Project

A comprehensive survey application to analyze and improve home energy efficiency, developed by NSS SSET 182 & 328.

## About the Project

The Carbon Neutral Home Project is an initiative aimed at helping homeowners understand their current energy consumption patterns and identify opportunities to reduce their carbon footprint. This web-based survey application collects detailed information about home energy usage and provides personalized recommendations for achieving carbon neutrality.

### Key Features

- **Multi-step Survey**: Comprehensive 6-step questionnaire covering:
  - Appraiser information and contact details
  - Home connection and infrastructure details
  - Energy usage patterns and consumption data
  - Utility bill estimation and analysis
  - Equipment and appliance inventory
  - Summary with potential savings calculations

- **Data Collection**: Secure storage of survey responses for analysis
- **Admin Dashboard**: Administrative interface for reviewing collected data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Input validation and error handling

### Project Goals

1. **Energy Assessment**: Evaluate current home energy consumption
2. **Carbon Footprint Analysis**: Calculate environmental impact
3. **Improvement Recommendations**: Suggest energy-efficient upgrades
4. **Cost-Benefit Analysis**: Estimate potential savings from improvements
5. **Sustainability Education**: Raise awareness about home energy efficiency

### Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase for data storage
- **AI Integration**: Gemini API for intelligent analysis

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Project Structure

- `/components` - React components for survey steps and UI elements
- `/services` - Firebase and API service configurations
- `/types` - TypeScript type definitions
- `App.tsx` - Main application component with routing
- `AdminApp.tsx` - Administrative dashboard

## Contributing

This project is part of the NSS SSET 182 & 328 initiative. For questions or contributions, please contact the project team.

## License

This project is developed for educational and research purposes as part of the Carbon Neutral Home initiative.
