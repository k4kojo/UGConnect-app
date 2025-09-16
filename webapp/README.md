# Hospital Management System - React Web App

A modern, responsive Hospital Management System built with React, featuring role-based access control and comprehensive healthcare management features.

## 🏥 Features

### Multi-Role Support
- **Admin**: Complete system management, user management, department oversight
- **Doctor**: Patient management, appointment scheduling, medical records
- **Patient**: Appointment booking, medical history, health records
- **Accountant**: Financial management, billing, payment processing

### Key Functionalities

#### Admin Dashboard
- System overview with key metrics
- Department management
- Doctor and patient management
- Appointment oversight
- Financial reporting
- System status monitoring

#### Doctor Dashboard
- Today's patient appointments
- Patient management interface
- Medical records access
- Schedule management
- Treatment history

#### Patient Dashboard
- Appointment booking system
- Medical records access
- Health history tracking
- Doctor information
- Appointment management

#### Accountant Dashboard
- Financial overview and analytics
- Billing management
- Payment processing
- Revenue tracking
- Expense management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🔐 Demo Credentials

### Admin Access
- **Email**: admin@mail.com
- **Password**: Password@123

### Doctor Access
- **Email**: john@mail.com
- **Password**: password123

### Patient Access
- **Email**: alice@mail.com
- **Password**: password123

### Accountant Access
- **Email**: danny@mail.com
- **Password**: acc8520

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date manipulation
- **Recharts** - Data visualization

### Development Tools
- **Create React App** - React development environment
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.js       # Main layout with sidebar
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Login.js        # Login page
│   ├── admin/          # Admin pages
│   ├── doctor/         # Doctor pages
│   ├── patient/        # Patient pages
│   └── accountant/     # Accountant pages
├── services/           # API services
│   └── authService.js  # Authentication service
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Green (#22C55E) - Success states
- **Danger**: Red (#EF4444) - Error states
- **Neutral**: Gray scale for text and backgrounds

### Components
- **Cards**: Consistent card layouts with shadows
- **Buttons**: Primary, secondary, outline, and danger variants
- **Forms**: Styled input fields with focus states
- **Navigation**: Responsive sidebar with role-based menus

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=Hospital Management System
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Responsive breakpoints
- Custom component classes

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Role-based access control
- Protected routes
- Authentication context
- Secure token storage
- Input validation

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Vercel
1. Import your GitHub repository
2. Vercel will auto-detect React settings
3. Deploy with default settings

### Traditional Hosting
1. Run `npm run build`
2. Upload `build/` folder to your web server
3. Configure server for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Migration from PHP

This React application is a modern conversion of the original PHP CodeIgniter Hospital Management System. Key improvements include:

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Better Performance**: Client-side rendering and optimized bundle
- **Enhanced Security**: Modern authentication patterns
- **Improved Maintainability**: Component-based architecture
- **Better User Experience**: Real-time updates and smooth interactions

## 📊 Database Schema

The application is designed to work with the original database schema:

### Core Tables
- `admin` - Administrator accounts
- `doctor` - Doctor profiles and schedules
- `patient` - Patient information
- `accountant` - Financial staff accounts
- `department` - Hospital departments
- `appointment` - Appointment bookings
- `doctor_schedule` - Doctor availability

### Relationships
- Doctors belong to departments
- Appointments link patients to doctors
- Schedules define doctor availability
- All users have role-based access

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication
- ✅ Role-based dashboards
- ✅ Responsive design
- ✅ Mock data integration

### Phase 2 (Future)
- 🔄 Real API integration
- 🔄 Advanced appointment booking
- 🔄 Medical records management
- 🔄 Payment processing
- 🔄 Email notifications
- 🔄 Mobile app

### Phase 3 (Advanced)
- 🔄 AI-powered diagnostics
- 🔄 Telemedicine features
- 🔄 Advanced analytics
- 🔄 Multi-language support
- 🔄 Offline capabilities

---

**Built with ❤️ for modern healthcare management**
