import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Building2, Shield, Heart, Stethoscope, Activity, Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import payorAPI from '../services/payorAPI';

export default function LoginForm({ onLogin }) {
  const [activeTab, setActiveTab] = useState('patient');
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(''); // 'sending', 'sent', 'error'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Dynamic field labels based on user type - payor now uses email
  const fieldLabel = activeTab === 'payor' ? 'Email Address' : 'Email Address';
  const fieldPlaceholder = activeTab === 'payor' ? 'Enter your email address' : 'Enter your email address';
  const fieldType = activeTab === 'payor' ? 'email' : 'email';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      // For payor login, authenticate with the backend
      if (activeTab === 'payor') {
        try {
          // Use the singleton payorAPI instance
          
          console.log('Attempting payor authentication with:', formData.email);
          console.log('PayorAPI loaded:', payorAPI);
          
          // Try to authenticate with the backend
          console.log('Calling authenticatePayor method...');
          const payorResponse = await payorAPI.authenticatePayor(formData.email, formData.password);
          
          console.log('Payor authentication successful:', payorResponse);
          console.log('Response type:', typeof payorResponse);
          console.log('Response authenticated:', payorResponse?.authenticated);
          
          // Check if we got a valid response
          if (payorResponse && payorResponse.authenticated) {
            // Set auth headers for future requests
            payorAPI.setPayorAuth(formData.email, formData.password);
            
            // Login successful - pass the payor response data
            console.log('Calling onLogin with response data...');
            onLogin(activeTab, formData.email, payorResponse);
          } else {
            console.error('Authentication response invalid:', payorResponse);
            alert('Authentication failed - invalid response from server');
            return;
          }
        } catch (error) {
          console.error('Payor authentication failed:', error);
          console.error('Error type:', typeof error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error status:', error.status);
          console.error('Full error object:', error);
          alert(`Invalid payor credentials. Please check your email address and password. Error: ${error.message}`);
          return;
        }
      } else {
        // For patient/provider, use simple authentication
        onLogin(activeTab, formData.email);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setForgotPasswordStatus('error');
      return;
    }

    setForgotPasswordStatus('sending');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      setForgotPasswordStatus('sent');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setForgotPasswordStatus('');
        setIsForgotPassword(false);
        setFormData({ ...formData, email: '' });
      }, 5000);
    } catch (error) {
      setForgotPasswordStatus('error');
    }
  };

  const resetToLogin = () => {
    setIsForgotPassword(false);
    setIsRegister(false);
    setForgotPasswordStatus('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  const userTypes = [
    {
      id: 'patient',
      label: 'Patient',
      icon: User,
      description: 'Access your health records and track claims',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'provider',
      label: 'Provider',
      icon: Stethoscope,
      description: 'Manage patient care and submit claims',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'payor',
      label: 'Payor',
      icon: Shield,
      description: 'Review and process insurance claims',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full max-w-md mx-auto space-y-8">
        {/* Mobile Header */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4ea8de] to-[#4ade80] rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">HealthClaim Portal</h1>
            <p className="text-gray-600 text-lg">
              {isForgotPassword 
                ? 'Reset your password' 
                : isRegister 
                ? 'Create your healthcare account' 
                : 'Sign in to continue'}
            </p>
          </div>
        </div>

        {/* Mobile Form */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl">
          <CardContent className="space-y-8 p-8">

            {isForgotPassword ? (
              /* Forgot Password Form */
              <div className="space-y-6">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={resetToLogin}
                  className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>

                {/* Forgot Password Content */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#4ea8de]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600">
                      No worries! Enter your email address and we'll send you a reset link.
                    </p>
                  </div>
                </div>

                {forgotPasswordStatus === 'sent' ? (
                  <div className="text-center space-y-4 py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h3>
                      <p className="text-gray-600">
                        We've sent a password reset link to <strong>{formData.email}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Check your inbox and spam folder. The link will expire in 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm text-gray-700">Email Address</Label>
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                        className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl"
                      />
                      {forgotPasswordStatus === 'error' && (
                        <p className="text-sm text-red-600">Please enter a valid email address.</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={forgotPasswordStatus === 'sending'}
                      className="w-full h-12 bg-[#4ea8de] hover:bg-[#3d8bbd] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordStatus === 'sending' ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Reset Link...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              /* Regular Login/Register Form */
              <>
                {/* Role Selector */}
                <div className="space-y-4">
                  <Label className="text-base text-gray-700">Select Your Role</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl h-auto">
                      {userTypes.map((type) => (
                        <TabsTrigger
                          key={type.id}
                          value={type.id}
                          className="flex flex-col items-center py-4 px-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                          <type.icon className={`w-6 h-6 mb-1 ${type.color}`} />
                          <span className="font-medium">{type.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {userTypes.map((type) => (
                      <TabsContent key={type.id} value={type.id} className="mt-4">
                        <div className={`text-center p-4 ${type.bgColor} rounded-xl border border-gray-100`}>
                          <type.icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                          <p className="text-sm text-gray-700 leading-relaxed">{type.description}</p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#4ea8de] hover:bg-[#3d8bbd] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center space-y-3">
              <Button
                variant="ghost"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#4ea8de] hover:text-[#3d8brd] hover:bg-blue-50 rounded-lg"
              >
                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </Button>
              
              {!isRegister && (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Forgot Password?
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-2 gap-16 items-center">
        {/* Left side - Form */}
        <Card className="w-full max-w-lg mx-auto shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4ea8de] to-[#4ade80] rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl text-gray-900 mb-2">
                HealthClaim Portal
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                {isForgotPassword 
                  ? 'Reset your password' 
                  : isRegister 
                  ? 'Create your healthcare account' 
                  : 'Sign in to continue'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {isForgotPassword ? (
              /* Forgot Password Form - Desktop */
              <div className="space-y-6">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={resetToLogin}
                  className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>

                {/* Forgot Password Content */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#4ea8de]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600">
                      No worries! Enter your email address and we'll send you a reset link.
                    </p>
                  </div>
                </div>

                {forgotPasswordStatus === 'sent' ? (
                  <div className="text-center space-y-4 py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h3>
                      <p className="text-gray-600">
                        We've sent a password reset link to <strong>{formData.email}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Check your inbox and spam folder. The link will expire in 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email-desktop" className="text-sm text-gray-700">Email Address</Label>
                      <Input
                        id="reset-email-desktop"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                        className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl"
                      />
                      {forgotPasswordStatus === 'error' && (
                        <p className="text-sm text-red-600">Please enter a valid email address.</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={forgotPasswordStatus === 'sending'}
                      className="w-full h-12 bg-[#4ea8de] hover:bg-[#3d8bbd] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordStatus === 'sending' ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Reset Link...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              /* Regular Login/Register Form - Desktop */
              <>
                {/* Role Selector */}
                <div className="space-y-4">
                  <Label className="text-base text-gray-700">Select Your Role</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl h-auto">
                      {userTypes.map((type) => (
                        <TabsTrigger
                          key={type.id}
                          value={type.id}
                          className="flex flex-col items-center py-4 px-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                          <type.icon className={`w-6 h-6 mb-1 ${type.color}`} />
                          <span className="font-medium">{type.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {userTypes.map((type) => (
                      <TabsContent key={type.id} value={type.id} className="mt-4">
                        <div className={`text-center p-4 ${type.bgColor} rounded-xl border border-gray-100`}>
                          <type.icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                          <p className="text-sm text-gray-700 leading-relaxed">{type.description}</p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      className="h-12 bg-gray-50 border-gray-200 focus:border-[#4ea8de] focus:ring-[#4ea8de] rounded-xl pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#4ea8de] hover:bg-[#3d8bbd] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center space-y-3">
              <Button
                variant="ghost"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#4ea8de] hover:text-[#3d8bbd] hover:bg-blue-50 rounded-lg"
              >
                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </Button>
              
              {!isRegister && (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Forgot Password?
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right side - Healthcare Illustration Banner */}
        <div className="flex flex-col items-center justify-center space-y-8 p-8">
          <div className="w-full max-w-lg bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-3xl p-10 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#4ea8de] to-[#4ade80] rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl text-gray-900 mb-4">Modern Healthcare Claims</h3>
            <p className="text-[#6b7280] leading-relaxed mb-8">
              Streamline your healthcare insurance workflow with our comprehensive platform. 
              Secure, efficient, and designed for modern healthcare needs.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <User className="w-8 h-8 mx-auto mb-3 text-[#4ea8de]" />
                <p className="text-xs text-[#6b7280] font-medium">Patient Care</p>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Stethoscope className="w-8 h-8 mx-auto mb-3 text-[#4ade80]" />
                <p className="text-xs text-[#6b7280] font-medium">Provider Tools</p>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Shield className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <p className="text-xs text-[#6b7280] font-medium">Insurance Hub</p>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-[#6b7280]">Trusted by healthcare professionals</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#4ea8de]" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-[#4ade80]" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
