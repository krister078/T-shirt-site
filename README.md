# T4U - Tees for You 👕

A modern, full-featured T-shirt e-commerce platform built with Next.js, Supabase, and TypeScript. Create, customize, and sell your own T-shirt designs in a beautiful, user-friendly marketplace.

## 🚀 Live Demo

**🌐 [Visit T4U Live Application](https://t-shirt-site-nine.vercel.app/)**

Try out the platform:
- Browse existing T-shirt designs
- Create your own custom T-shirts
- Experience the full e-commerce workflow
- Test the design studio and shopping cart

*Scan the QR code or visit the link above to access the live application*

![T4U Platform](https://img.shields.io/badge/Platform-T4U-blue) ![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Features

### 🎨 T-Shirt Design Studio
- **Interactive Design Canvas** - Drag, drop, resize, and rotate design elements
- **Front & Back Views** - Design both sides of your T-shirt
- **Color Customization** - Choose from a wide range of T-shirt colors
- **Real-time Preview** - See your design come to life instantly
- **File Upload Support** - Upload your own images and graphics

### 🛒 E-Commerce Platform
- **Product Marketplace** - Browse and discover amazing T-shirt designs
- **Shopping Cart** - Add multiple items with size selection
- **Secure Checkout** - Complete order processing with address and payment
- **Order Management** - Track your orders and purchase history
- **User Profiles** - Manage personal information and preferences

### 📦 Order & Shipping
- **Order Tracking** - Complete order lifecycle management
- **Shipping Labels** - Generate PDF shipping labels with Cyrillic support
- **Address Management** - Save and manage shipping addresses
- **Payment Processing** - Secure payment method storage

### 🔐 Authentication & Security
- **User Authentication** - Secure signup and login with Supabase Auth
- **Row Level Security (RLS)** - Database-level security policies
- **Profile Management** - User account and preference management
- **Data Protection** - Secure handling of personal and payment information

## 🚀 Tech Stack

### Frontend
- **[Next.js 15.5.3](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with modern features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level access control
- **Real-time subscriptions** - Live data updates

### Additional Libraries
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation for shipping labels
- **[html2canvas](https://html2canvas.hertzen.com/)** - Canvas-based PDF rendering
- **Supabase Auth UI** - Pre-built authentication components

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Supabase account** for backend services
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/T-shirt-site.git
cd T-shirt-site
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the following SQL scripts in your Supabase SQL Editor in order:

1. **Initial Schema:**
   ```bash
   # Run: supabase-schema.sql
   ```

2. **T-shirt Design Support:**
   ```bash
   # Run: update-shirts-schema.sql
   ```

3. **Preview Images:**
   ```bash
   # Run: add-preview-images.sql
   ```

4. **Orders System:**
   ```bash
   # Run: create-orders-table.sql
   ```

5. **Phone Support:**
   ```bash
   # Run: add-phone-to-orders.sql
   # Run: add-phone-to-addresses.sql
   ```

6. **Order Processing:**
   ```bash
   # Run: fix-phone-in-orders-v2.sql
   ```

7. **User Registration Fix:**
   ```bash
   # Run: fix-signup-trigger.sql
   ```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
T-shirt-site/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Order checkout
│   │   ├── create-tshirt/     # Design studio
│   │   ├── dashboard/         # Main marketplace
│   │   ├── orders/            # Order management
│   │   └── profile/           # User profile
│   ├── components/            # Reusable React components
│   │   ├── cart/             # Cart-related components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   ├── orders/           # Order components
│   │   ├── profile/          # Profile components
│   │   ├── tshirt/           # T-shirt design components
│   │   └── ui/               # UI primitives
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── *.sql                     # Database migration scripts
└── config files             # Next.js, Tailwind, TypeScript configs
```

## 🎯 Key Features Walkthrough

### Creating a T-Shirt Design
1. Navigate to **Create T-Shirt** from the dashboard
2. Fill in basic information (name, description, price)
3. Choose your T-shirt color
4. Upload and position design elements
5. Switch between front and back views
6. Save your design

### Shopping Experience
1. Browse designs on the **Dashboard**
2. Add items to cart with size selection
3. View cart and manage quantities
4. Proceed to **Checkout**
5. Enter shipping and payment information
6. Complete your order

### Order Management
1. View order history in **My Orders**
2. Track order status and details
3. Generate shipping labels (PDF)
4. Manage delivery information

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run all SQL migration scripts in order
3. Configure authentication settings
4. Set up storage buckets for file uploads
5. Configure RLS policies

### Authentication
The app uses Supabase Auth with:
- Email/password authentication
- Profile creation on signup
- Row Level Security for data access

## 📱 Responsive Design

T4U is fully responsive and optimized for:
- **Desktop** - Full-featured design studio and shopping experience
- **Tablet** - Touch-friendly interface with adapted layouts
- **Mobile** - Mobile-optimized browsing and purchasing

## 🌍 Internationalization

The application includes:
- **Cyrillic Support** - Native Bulgarian text rendering in PDFs
- **Multi-language Ready** - Structured for easy localization
- **Regional Formatting** - Currency and address formats

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity
- Write descriptive commit messages
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/T-shirt-site/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide your environment details

## 🙏 Acknowledgments

- **Supabase** - For the excellent backend-as-a-service platform
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For seamless deployment and hosting

## 📊 Project Status

- ✅ **Core Features** - Complete
- ✅ **Authentication** - Complete
- ✅ **Design Studio** - Complete
- ✅ **E-commerce** - Complete
- ✅ **Order Management** - Complete
- ✅ **PDF Generation** - Complete
- 🔄 **Testing Suite** - In Progress
- 🔄 **Documentation** - In Progress

---

**Built with ❤️ for the creative community**

*T4U - Where creativity meets commerce* 🎨👕